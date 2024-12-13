const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const { Collection } = require('discord.js');
const { set, getSet } = require(global.utilsPath);
const spectraget = require('spectraget');
const { config: { colors } } = require('extend-console');

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

class EndpointsManager {
	constructor() {
		this.server = null;

		const app = express();
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({ extended: true }));
		app.use((req, res, next) => {
			next();
		});

		app.get('/api/private/*', this.requestTrigger.bind(this));
		app.get('/api/public/*', this.requestTrigger.bind(this));
		this.server = http.createServer(app);

		this.endpointScopes = new Collection();
	}

	load(filePath) {
		try {
			const type = path.basename(path.dirname(filePath));
			const name = path.basename(filePath, '.js');
			const registerEndpoint = (scope) => this.endpointScopes.set(`${type}/${name}`, scope);
			const endpoint = require(filePath);
			const { listen, report, params, handler } = require(filePath);
			if (!handler) {
				console.reportWarn(`The endpoint at ${filePath} is missing a required "handler" function`);
				registerEndpoint(null);
				return;
			}
			if (typeof handler !== 'function') {
				console.reportWarn(`The endpoint at ${filePath} has a "handler" attribute of type ${typeof handler}, expected function`);
				registerEndpoint(null);
				return;
			}
			if (!params) {
				console.reportWarn(`The endpoint at ${filePath} is missing a required "params" array`);
				registerEndpoint(null);
				return;
			}
			if (!Array.isArray(params)) {
				console.reportWarn(`The endpoint at ${filePath} has a "params" attribute of type ${typeof params}, expected array`);
				registerEndpoint(null);
				return;
			}
			if (!listen) {
				registerEndpoint({ listen: null });
				return;
			}
			const endpointScope = {};
			set(endpointScope, 'handler', handler.bind(endpointScope));
			set(endpoint, 'type', type);
			set(endpoint, 'name', name);
			set(endpoint, 'params', params);
			set(endpointScope, 'report', report ? () => reportEndpoint(endpointScope) : () => {});
			set(endpointScope, 'endpoint', endpoint);
			set(endpointScope, 'set', getSet(true, true).bind(endpointScope));
			registerEndpoint(endpointScope);
			console.report(`Endpoint loaded: ${name}`);
		} catch (err) {
			console.reportError(`Error loading endpoint from file ${filePath}:`, err);
		}
	}

	loadAll() {
		try {
			console.report('Loading all endpoints...');
			['public', 'private'].forEach(folder => {
				const endpointsFolder = path.join(global.endpointsFolder, folder);
				const commandFiles = fs.readdirSync(endpointsFolder);
				for (const name of commandFiles) {
					const filePath = path.join(endpointsFolder, name);
					this.load(filePath);
				}
			});
			console.report('All endpoints loaded');
		} catch (err) {
			console.reportError('Error loading endpoints:', err);
		}
	}

	watch() {
		const watcher = chokidar.watch(global.endpointsFolder, {
			persistent: true,
			ignored: /(^|[\/\\])\../,
			ignoreInitial: true,
		});
		watcher.on('change', this.onFileChange.bind(this));
		watcher.on('add', this.onFileChange.bind(this));

		const endpointsFileWatcher = chokidar.watch(global.endpointsFolder + '.js', {
			persistent: true,
			ignoreInitial: true,
		});
		endpointsFileWatcher.on('change', this.onFileChange.bind(this));
		endpointsFileWatcher.on('add', this.onFileChange.bind(this));

		console.report(`Watching endpoints...`);
	}

	onFileChange(filePath) {
		delete require.cache[require.resolve(filePath)];
		this.load(filePath);
	}

	reload() {
		try {
			['public', 'private'].forEach(folder => {
				const endpointsFolder = path.join(global.endpointsFolder, folder);
				for (const name of fs.readdirSync(endpointsFolder)) {
					this.onFileChange(path.join(endpointsFolder, name));
				}
			});
			delete require.cache[require.resolve(global.endpointsFolder)];
			this.endpoints = require(global.endpointsFolder);
		} catch (err) {
			console.reportError('Error reloading endpoints:', err);
		}
	}

	listen() {
		if (global.apiPort) {
			this.server.listen(global.apiPort, () => {
				console.report(`API is running on port ${global.apiPort}`);
			});
		} else {
			console.reportError('API could not start, API port not defined.');
		}
	}

	async requestTrigger(req, res) {
		try {
			const parts = req.path.split('/');
			const type = parts[2];
			const name = parts[3];
			const code = `${type}/${name}`;

			const endpointScope = this.endpointScopes.get(code);
			if (!endpointScope) {
				res.status(400).json(`cannot get /${code}`);
				return;
			}

			const endpoint = endpointScope.endpoint;
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
			endpointScope.set('request', req);
			endpointScope.report();

			const resData = await endpointScope.handler(params);

			if (resData.error && resData.error === 'Unauthorized') {
				res.status(resData.status_code || 200).json(resData.error);
			} else {
				res.status(resData.status_code || 200).json(resData || resData.error);
			}
		} catch (err) {
			console.reportError('Unexpected error in handling request:', err);
			res.status(500).json('Internal Server Error');
		}
	}
}

module.exports = {
	EndpointsManager,
	setReportEndpointFunctions
};
