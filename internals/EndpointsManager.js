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
		logContext.functionName = `${args[0].type}/${args[0].name}`;
		return defaultLogFormat(logContext, ...args.slice(1));
	}

	function formatArgs(logContext, ...args) {
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
			const { listen, report, params, handler } = require(file);
			if (!handler) {
				console.reportWarn(`The endpoint at ${file} is missing a required "handler" function`);
				return [false, null];
			}
			if (typeof handler !== 'function') {
				console.reportWarn(`The endpoint at ${file} has a "handler" attribute of type ${typeof handler}, expected function`);
				return [false, null];
			}
			if (!params) {
				console.reportWarn(`The endpoint at ${file} is missing a required "params" array`);
				return [false, null];
			}
			if (!Array.isArray(params)) {
				console.reportWarn(`The endpoint at ${file} has a "params" attribute of type ${typeof params}, expected array`);
				return [false, null];
			}
			if (!listen) {
				console.reportWarn(`The endpoint ${code} is not listening`);
				return [false, null];
			}
			const scope = {};
			set(scope, 'type', type);
			set(scope, 'name', name);
			set(scope, 'route', route);
			set(scope, 'params', params);
			set(scope, 'set', getSet(true).bind(scope));

			async function requestTrigger(req, res) {
				try {
					const error = spectraget.validate(params, req.query);
					if (error) {
						res.status(error.status_code).json(error);
						return;
					}

					function get(name, key) {
						const item = params.find(obj => obj.name === name);
						return item ? item[key] : false;
					}

					if (get('key', 'mandatory') && req.query?.key !== "bAhRTVpaXS4FvEeD9k2KLOI6Ho92MReU") {
						const status_code = 401;
						res.status(status_code).json({ status_code: status_code, error: 'Unauthorized' });
						return;
					}
					scope.set('request', req, true, true, false);
					if (report) {
						reportEndpoint(scope)
					}

					const resData = await (handler.bind(scope))(req.query);

					res.status(resData.status_code).json(resData);
				} catch (err) {
					console.reportError('Unexpected error in handling request:', err);
					const status_code = 500;
					res.status(status_code).json({ status_code: status_code, error: 'Internal Server Error' });
				}
			}

			this.app.get(route, requestTrigger);
			return [true, scope];
		} catch (err) {
			console.reportError(`Error loading endpoint from file ${file}:`, err);
		}
	}

	_unload(file, scope) {
		delete require.cache[require.resolve(file)];
		this.app._router.stack = this.app._router.stack.filter(layer => layer?.route?.path !== scope.route);
	}

	reportLoadEnd(file) { console.report(`Listening to endpoint ${this.formatFile(file)}...`); }
	
	reportUnloadEnd(file) { console.report(`Stopped listening to endpoint ${this.formatFile(file)}`); }
	
	reportReloadStart(file) { console.report(`Reloading endpoint ${this.formatFile(file)}...`); }
	reportReloadEnd(file) { console.report(`Endpoint ${this.formatFile(file)} reloaded`); }
}

module.exports = {
	EndpointsManager,
	setReportEndpointFunctions
};
