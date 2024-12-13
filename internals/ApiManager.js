const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const { Collection } = require('discord.js');
const { set, getSet } = require(global.utilsPath);

let reportEndpoint;
let reportEndpointWarn;
let reportEndpointError;

function setReportEndpointFunctions() {
	const { defaultLogFormat, defaultFormatArgsForWarn, defaultFormatArgsForError, defaultShouldLog } = require('extend-console');

	function logFormat(logContext, ...args) {
		logContext.functionName = `${args[0]}/${args[1]}`;
		return defaultLogFormat(logContext, ...args.slice(2));
	}

	function formatArgs(logContext, endpoint) {
		let formattedArgs = `\n ${colors['FgCyan']}name${colors['Reset']}="${colors['FgYellow']}${endpoint.name}${colors.Reset}"`;
		formattedArgs += `\n ${colors['FgCyan']}type${colors['Reset']}="${colors['FgYellow']}${endpoint.type}${colors.Reset}"`;

		endpoint.params.forEach(param => {
			formattedArgs += `\n ${colors['FgCyan']}param${colors['Reset']}="${colors['FgYellow']}name: ${param.name}, type: ${param.type}, mandatory: ${param.mandatory}`;
			if (param.length) {
				formattedArgs += `, length: ${param.length}`;
			}
			if (param.range) {
				formattedArgs += `, range: [${param.range.join(', ')}]`;
			}
			formattedArgs += `${colors.Reset}"`;
		});

		return console.fitOnTerm(formattedArgs);
	}

	function shouldLog(logContext, ...args) {
		// TODO: always report all for now
		// return defaultShouldLog(logContext, ...args) && global.reportEndpoints && global.configReportEndpoints[`${args[0]}/${args[1]}`];
		return defaultShouldLog(logContext, ...args) && true && true;
	}

	reportEndpoint = console.createReport(logFormat, formatArgs, shouldLog);
	reportEndpointWarn = console.createReportWarn(logFormat, defaultFormatArgsForWarn, shouldLog);
	reportEndpointError = console.createReportError(logFormat, defaultFormatArgsForError, shouldLog);
}

function shouldListen(type, name) {
	// TODO: listen to all for now
	// return global.apiEnable && global.configListenEndpoints[`${args[0]}/${args[1]}`];
	return global.apiEnable && true;
}

class ApiManager {
	constructor() {
		this.endpoints = require(global.endpointsFolder);

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
			const endpoint = this.endpoints.find(e => e.type === type && e.name === name);
			if (!endpoint) {
				console.reportWarn(`The endpoint at ${filePath} is missing a required endpoint info entry in ${global.endpointsFolder}.js`);
				return;
			}
			const { handler } = require(filePath);
			if (!handler || typeof handler !== 'function') {
				console.reportWarn(`The endpoint at ${filePath} is missing a required "handler" function`);
				return;
			}
			if (!shouldListen(type, name)) return;
			const endpointScope = {};
			set(endpointScope, 'handler', handler.bind(endpointScope));
			set(endpointScope, 'endpoint', endpoint);
			set(endpointScope, 'set', getSet(endpointScope, true, true).bind(endpointScope));
			this.endpointScopes.set(`${type}/${name}`, endpointScope);
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
			
			if (!shouldHandle(code)) return;

			const endpointScope = this.endpointScopes.get(code);
			if (!endpointScope) {
				res.status(400).json(`cannot get /${code}`);
				return;
			}


			const resData = await endpointScope.set('request', req).handler(req.query);

			if (resData.error && resData.error === 'Unauthorized') {
				res.status(resData.status_code || 200).json(resData.error);
			} else {
				res.status(resData.status_code || 200).json(resData || resData.error);
			}
		} catch (err) {
			console.reportError('Unexpected error in routing:', err);
			res.status(500).json('Internal Server Error');
		}
	}
}

module.exports = {
	ApiManager,
	setReportEndpointFunctions
};
