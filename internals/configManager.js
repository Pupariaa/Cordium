const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { validPort, validChannelId, capitalize, toCamelCase, loadEnvPath, setReportFunctions } = require(global.utilsPath);
const { Events } = require('discord.js');

class ConfigManager {
	constructor() {
		this.envFilename = 'config.env';
		this.path = path.join(global.projectRoot, 'config');
	}

	watch() {
		const watcher = chokidar.watch(this.path, {
			persistent: true,
			ignored: /(^|[\/\\])\../,
			ignoreInitial: true,
		});

		// reload all config if any changed for simplicity, it's so quick anyway
		watcher.on('change', this.load.bind(this));
		watcher.on('add', this.load.bind(this));

		console.report(`Watching config...`);
	}

	reload() {
		this.load();
		setReportFunctions();
	}

	load() {
		const defaultEndpointsFolder = './src/api/endpoints';
		const defaultCommandsFolder = './src/commands';
		const defaultEventsFolder = './src/events';
		const defaultFilesFolder = './src/files';
		const defaultSandboxFolder = './src/sandbox';
		const defaultPort = 3000;

		const envPath = path.join(this.path, this.envFilename);
		const envConfig = dotenv.config({ path: envPath });
		const env = envConfig.parsed;
		if (envConfig.error) {
			console.reportError(`Error loading ${envPath} file:`, envConfig.error);
			process.exit(1);
		}

		const missingVars = [];
		for (const requiredVar of ['client_token', 'client_id', 'discord_guild_id']) {
			if (!env[requiredVar]) missingVars.push(requiredVar);
			if (missingVars.length > 0) break;
			Object.defineProperty(global, toCamelCase(requiredVar), {
				value: env[requiredVar],
				configurable: false,
				enumerable: true,
				writable: true,
			});
		}
		if (missingVars.length > 0) {
			console.reportError('Missing required environment variables:', ...missingVars);
			process.exit(1);
		}
		global.listenEvents = env.listen_events ? env.listen_events.toLowerCase() === 'true' : true;
		global.reportEvents = env.report_events ? env.report_events.toLowerCase() === 'true' : true;

		global.endpointsFolder = loadEnvPath(env.endpoints_folder, defaultEndpointsFolder);
		global.commandsFolder = loadEnvPath(env.commands_folder, defaultCommandsFolder);
		global.eventsFolder = loadEnvPath(env.events_folder, defaultEventsFolder);
		global.filesFolder = loadEnvPath(env.files_folder, defaultFilesFolder);
		global.sandboxFolder = loadEnvPath(env.sandbox_folder, defaultSandboxFolder);

		global.apiEnable = env.api_enable ? env.api_enable.toLowerCase() === 'true' : false;
		global.apiPort = env.api_port ? validPort(env.api_port) ? env.api_port : defaultPort : defaultPort;
		global.utcDiff = parseInt((env.utc_diff ? env.utc_diff : 0) * 60 * 60 * 1000);

		const config_channels_path = path.join(global.projectRoot, 'config', 'channels.json');
		try {
			global.configChannels = JSON.parse(fs.readFileSync(config_channels_path, 'utf-8'));
		} catch (err) {
			console.reportError(`Error loading ${config_channels_path}:`, err);
			process.exit(1);
		}
		if (Object.values(global.configChannels).every((channels) => Object.keys(channels).length === 0)) {
			console.reportWarn('No channels in config/channels.json.');
		}
		for (const basename of ['reportEvents', 'listenEvents']) {
			const filename = `${basename}.json`;
			const jsonPath = path.join(global.projectRoot, 'config', filename);
			const json = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
			Object.defineProperty(global, `config${capitalize(basename)}`, {
				value: json,
				configurable: false,
				enumerable: true,
				writable: true,
			});
			for (const eventName of Object.keys(Events)) {
				if (!Object.keys(json).includes(eventName) && eventName !== Events.ClientReady) {
					console.reportWarn(`Missing ${eventName} in ${filename}`);
				}
			}
		}

		global.dev = env.dev ? env.dev.toLowerCase() === 'true' : false;

		console.report('Config loaded');
	}
}

module.exports = ConfigManager;
