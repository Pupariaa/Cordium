const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const { Collection } = require('discord.js');

global.endpoints = require(global.endpointsFolder);

class ApiManager {
	constructor() {
		this.server = null;

		const app = express();
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({ extended: true }));
		app.use((req, res, next) => next());
		
		app.get('/api/private/*', this.requestHandler.bind(this));
		app.get('/api/public/*', this.requestHandler.bind(this));
		this.server = http.createServer(app);

		this.endpoints = new Collection();
	}

	load(filePath) {
		try {
			const endpoint = require(filePath);
			if ('handleRequest' in endpoint && typeof endpoint.handleRequest === 'function') {
				const type = path.basename(path.dirname(filePath));
				const name = path.basename(filePath, '.js');
				this.endpoints.set(`${type}/${name}`, endpoint);
				console.report(`Endpoint loaded: ${name}`);
			} else {
				console.reportWarn(`The endpoint at ${filePath} is missing a required "handleRequest" function`);
			}
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
			global.endpoints = require(global.endpointsFolder);
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

	async requestHandler(req, res) {
		// let logData = {};
		try {
			// const client_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			const reqData = req.query;
			const parts = req.path.split('/');
			const type = parts[2];
			const name = parts[3];
			const code = `${type}/${name}`;

			const endpoint = global.endpoints.find(e => e.type === type && e.name === name);
			if (!endpoint) {
				res.status(400).json(`cannot get /${code}`);
				// logData = { client: client_ip, error: `cannot get /${code}`, status_code: 400, request_data: reqData };
				return;
			}
			
			const handler = this.endpoints.get(code);
			if (!handler) {
				// logData = { client: client_ip, error: `cannot get /${code}`, status_code: 400, request_data: reqData };
				res.status(400).json(`cannot get /${code}`);
			}
			
			const resData = await handler.handleRequest(endpoint, reqData);
			
			if (resData.error && resData.error === 'Unauthorized') {
				// logData = { client: client_ip, endpoint: code, error: resData.error, status_code: resData.status_code, request_data: reqData };
				res.status(resData.status_code || 200).json(resData.error);
			} else {
				res.status(resData.status_code || 200).json(resData || resData.error);
				// logData = { client: client_ip, endpoint: code, request_data: reqData };
			}
		} catch (err) {
			console.reportError('Unexpected error in routing:', err);
			res.status(500).json('Internal Server Error');
		}
	}
}

module.exports = ApiManager;
