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
		const app = express();
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({ extended: true }));
		app.use((req, res, next) => next());
		['public', 'private'].forEach(folder => {
			app.get(`/api/${folder}/*`, this.requestTrigger.bind(this));
			const endpointsFolder = path.join(global.endpointsFolder, folder);
			fs.readdirSync(endpointsFolder).forEach(name => this.add(path.join(endpointsFolder, name)));
		});
		this.server = http.createServer(app);
	}

	_load(file) {
		try {
			const type = path.basename(path.dirname(file));
			const name = path.basename(file, '.js');
			const endpoint = require(file);
			const { listen, report, params, handler } = require(file);
			if (!handler) {
				console.reportWarn(`The endpoint at ${file} is missing a required "handler" function`);
				return;
			}
			if (typeof handler !== 'function') {
				console.reportWarn(`The endpoint at ${file} has a "handler" attribute of type ${typeof handler}, expected function`);
				return;
			}
			if (!params) {
				console.reportWarn(`The endpoint at ${file} is missing a required "params" array`);
				return;
			}
			if (!Array.isArray(params)) {
				console.reportWarn(`The endpoint at ${file} has a "params" attribute of type ${typeof params}, expected array`);
				return;
			}
			if (!listen) {
				console.reportWarn(`The endpoint ${type}/${name} is not listening`);
				return;
			}
			const scope = {};
			set(endpoint, 'type', type);
			set(endpoint, 'name', name);
			set(endpoint, 'params', params);
			set(scope, 'report', report ? () => reportEndpoint(scope) : () => { });
			set(scope, 'endpoint', endpoint);
			set(scope, 'set', getSet(true, true).bind(scope));
			set(scope, 'handler', handler.bind(scope));
			this.listeningEndpoints.set(`${type}/${name}`, scope);
			console.report(`Endpoint loaded: ${name}`);
		} catch (err) {
			console.reportError(`Error loading endpoint from file ${file}:`, err);
		}
	}

	_unload(file) {
		delete require.cache[require.resolve(file)];
	}

	listen() {
		if (global.apiPort) {
			this.server.listen(global.apiPort, () => console.report(`API is running on port ${global.apiPort}`));
		} else {
			console.reportError('API could not start, API port not defined');
		}
	}

	async requestTrigger(req, res) {
		try {
			const parts = req.path.split('/');
			const type = parts[2];
			const name = parts[3];
			const code = `${type}/${name}`;

			const scope = this.listeningEndpoints.get(code);
			if (!scope) {
				res.status(400).json(`cannot get /${code}`);
				return;
			}

			const endpoint = scope.endpoint;
			const params = req.query;

			const error = spectraget.validate(endpoint.params, params);
			if (error) {
				res.status(error.status_code).json(error);
				return;
			}

			function get(params, name, key) {
				const item = params.find(obj => obj.name === name);
				return item ? item[key] : undefined;
			}

			if (get(endpoint.params, 'key', 'mandatory') && params?.key !== "bAhRTVpaXS4FvEeD9k2KLOI6Ho92MReU") {
				const status_code = 401;
				res.status(status_code).json({ status_code: status_code, error: 'Unauthorized' });
				return;
			}
			scope.set('request', req);
			scope.report();

			const resData = await scope.handler(params);

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
