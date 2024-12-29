'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const { set, getSet } = require(global.utilsPath);
const spectraget = require('spectraget');
const { config: { colors } } = require('extend-console');
const { FilesManager } = require(global.filesManagerPath);

let reportEndpoint;
let reportEndpointWarn;
let reportEndpointError;

function setReportEndpointFunctions() {
	const { defaultLogFormat, defaultFormatArgsForWarn, defaultFormatArgsForError, defaultShouldLog } = require('extend-console');

	function logFormat(logContext, ...args) {
		const endpoint = args[0].endpoint;
		logContext.functionName = `${endpoint.type}/${endpoint.name}`;
		return defaultLogFormat(logContext, ...args.slice(1));
	}

	function formatArgs(logContext, ...args) {
		const endpoint = args[0].endpoint;
		let formattedArgs = '';

		const params = args[0].request.query;
		if (params && typeof params === 'object' && Object.keys(params).length > 0) {
			for (const [key, value] of Object.entries(params)) {
				formattedArgs += `\n ${colors['FgCyan']}${key}${colors['Reset']}="${colors['FgYellow']}${value}${colors.Reset}"`;
			}
		}

		return console.fitOnTerm(formattedArgs);
	}

	reportEndpoint = console.createReport(logFormat, formatArgs, defaultShouldLog);
	reportEndpointWarn = console.createReportWarn(logFormat, defaultFormatArgsForWarn, defaultShouldLog);
	reportEndpointError = console.createReportError(logFormat, defaultFormatArgsForError, defaultShouldLog);
}

class EndpointsManager extends FilesManager {
	constructor() {
		super([]);
		this.app = express();
		this.app.use(bodyParser.json());
		this.app.use(bodyParser.urlencoded({ extended: true }));
		this.app.use((req, res, next) => next());
		this.server = http.createServer(this.app);
		this.server.listen(global.apiPort, () => console.report(`API is running on port ${global.apiPort}`));
		const self = this;
		['public', 'private'].forEach(folder => {
			const endpointsFolder = path.join(global.endpointsFolder, folder);
			fs.readdirSync(endpointsFolder).forEach(name => self.add(path.join(endpointsFolder, name)));
		});
	}

	parseFile(file) {
		return { type: path.basename(path.dirname(file)), name: path.basename(file, '.js') };
	}

	fileToKey(file) {
		const { type, name } = this.parseFile(file);
		return `${type}/${name}`;
	}

	_load(file) {
		try {
			const { type, name } = this.parseFile(file);
			const code = `${type}/${name}`;
			const route = `/api/${code}`;
			const endpoint = require(file);
			const { listen, report, params, handler } = require(file);
			if (!handler) {
				console.reportWarn(`The endpoint at ${file} is missing a required "handler" function`);
				return [ false, null ];
			}
			if (typeof handler !== 'function') {
				console.reportWarn(`The endpoint at ${file} has a "handler" attribute of type ${typeof handler}, expected function`);
				return [ false, null ];
			}
			if (!params) {
				console.reportWarn(`The endpoint at ${file} is missing a required "params" array`);
				return [ false, null ];
			}
			if (!Array.isArray(params)) {
				console.reportWarn(`The endpoint at ${file} has a "params" attribute of type ${typeof params}, expected array`);
				return [ false, null ];
			}
			if (!listen) {
				console.reportWarn(`The endpoint ${code} is not listening`);
				return [ false, null ];
			}
			const scope = {};
			set(endpoint, 'type', type);
			set(endpoint, 'name', name);
			set(endpoint, 'route', route);
			set(endpoint, 'params', params);
			set(scope, 'endpoint', endpoint);
			set(scope, 'report', report ? () => reportEndpoint(scope) : () => { });
			set(scope, 'set', getSet(true).bind(scope));
			set(scope, 'handler', handler.bind(scope));
			this.app.get(route, this.requestTrigger.bind(scope));
			return  [ true, scope ];
		} catch (err) {
			console.reportError(`Error loading endpoint from file ${file}:`, err);
		}
	}

	reportLoad(file) {
		console.report(`Listening to endpoint ${this.formatFile(file)}...`);
	}

	_unload(file, content) {
		delete require.cache[require.resolve(file)];
		this.app._router.stack = this.app._router.stack.filter(layer => layer?.route?.path !== content.endpoint.route);
	}

	reportUnload(file) {
		console.report(`Stopped listening to endpoint ${this.formatFile(file)}`);
	}

	reportReload(file) {
		console.report(`Endpoint reloaded: ${this.formatFile(file)}`);
	}

	async requestTrigger(req, res) {
		try {
			const error = spectraget.validate(this.endpoint.params, req.query);
			if (error) {
				res.status(error.status_code).json(error);
				return;
			}

			function get(name, key) {
				const item = this.endpoint.params.find(obj => obj.name === name);
				return item ? item[key] : false;
			}

			if (get('key', 'mandatory') && req.query?.key !== "bAhRTVpaXS4FvEeD9k2KLOI6Ho92MReU") {
				const status_code = 401;
				res.status(status_code).json({ status_code: status_code, error: 'Unauthorized' });
				return;
			}
			this.set('request', req, false, true, false);
			this.report();

			const resData = await this.handler(req.query);

			res.status(resData.status_code).json(resData);
		} catch (err) {
			console.reportError('Unexpected error in handling request:', err);
			const status_code = 500;
			res.status(status_code).json({ status_code: status_code, error: 'Internal Server Error' });
		}
	}
}

module.exports = {
	EndpointsManager,
	setReportEndpointFunctions
};
