'use strict';

const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { getSet, validPort, validChannelId, capitalize, toCamelCase, loadEnvPath, getLoadEnvBool, setReportFunctions } = require(global.utilsPath);
const { Events } = require('discord.js');

const looseSet = getSet(true, true).bind(global);

class ConfigManager {
	constructor() {
		this.envFilename = 'config.env';
		this.envPath = path.join(global.projectRoot, 'config', this.envFilename);
	}

	load(envPath = this.envPath) {
		const defaultPort = 3000;

		const envConfig = dotenv.config({ path: envPath });
		const env = envConfig.parsed;

		if (envConfig.error) {
			console.reportError(`Error loading ${envPath} file:`, envConfig.error);
			process.exit(1);
		}

		(function loadPrototypes() {
			try {
				global.prototypesFolder = loadEnvPath(env.prototypes_folder, 'src/prototypes');
				[path.join(global.projectRoot, 'internals/prototypes'), global.prototypesFolder].forEach(folder => {
					if (!fs.existsSync(folder)) {
						fs.mkdirSync(folder);
					}
					fs.readdirSync(folder).forEach((filename) => {
						const filePath = path.join(folder, filename)
						delete require.cache[require.resolve(filePath)];
						require(filePath);
					});
				});
			} catch (err) {
				console.reportError(err);
			}
		})();

		const missingVars = [];
		for (const requiredVar of ['client_token', 'client_id', 'discord_guild_id']) {
			if (!env[requiredVar]) missingVars.push(requiredVar);
			if (missingVars.length > 0) break;
			looseSet(toCamelCase(requiredVar), env[requiredVar]);
		}
		if (missingVars.length > 0) {
			console.reportError('Missing required environment variables:', ...missingVars);
			process.exit(1);
		}
		const loadEnvBool = getLoadEnvBool.bind(env);

		global.listenEvents = loadEnvBool('listen_events', true);
		global.reportEvents = loadEnvBool('report_events', true);
		global.eventsFolder = loadEnvPath(env.events_folder, 'src/events');

		global.listenEndpoints = loadEnvBool('listen_endpoints', true);
		global.reportEndpoints = loadEnvBool('report_endpoints', true);
		global.endpointsFolder = loadEnvPath(env.endpoints_folder, 'src/endpoints');

		global.commandsFolder = loadEnvPath(env.commands_folder, 'src/commands');
		global.filesFolder = loadEnvPath(env.files_folder, 'src/files');
		global.sandboxFolder = loadEnvPath(env.sandbox_folder, 'src/sandbox');

		global.apiPort = env.api_port ? (validPort(env.api_port) ? env.api_port : defaultPort) : defaultPort;
		global.utcDiff = parseInt((env.utc_diff ? env.utc_diff : 0) * 60 * 60 * 1000);

		const configChannelsPath = path.join(global.projectRoot, 'config', 'channels.json');
		try {
			global.configChannels = JSON.parse(fs.readFileSync(configChannelsPath, 'utf-8'));
		} catch (err) {
			console.reportError(`Error loading ${configChannelsPath}:`, err);
			process.exit(1);
		}
		if (Object.values(global.configChannels).every((channels) => Object.keys(channels).length === 0)) {
			console.reportWarn('No channels in config/channels.json.');
		}

		global.dev = loadEnvBool('dev', false);

		console.report('Config loaded');
	}

	reload() {
		this.onFileChange(this.envPath);
	}

	onFileChange(filePath) {
		try {
			this.load(filePath);
			setReportFunctions();
		} catch (err) {
			console.reportError(`failed to reload config at ${filePath}:`, err);
		}
	}

	watch() {
		const watcher = chokidar.watch(this.path, {
			persistent: true,
			ignored: /(^|[\/\\])\../,
			ignoreInitial: true,
		});

		watcher.on('change', this.onFileChange.bind(this));
		watcher.on('add', this.onFileChange.bind(this));

		console.report(`Watching config...`);
	}
}

module.exports = {
	ConfigManager
};
