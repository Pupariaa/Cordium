const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { getSet, validPort, validChannelId, capitalize, toCamelCase, loadEnvPath, setReportFunctions } = require(global.utilsPath);
const { Events } = require('discord.js');

const looseSet = getSet(true, true).bind(global);

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
		const defaultEndpointsFolder = 'src/endpoints';
		const defaultCommandsFolder = 'src/commands';
		const defaultEventsFolder = 'src/events';
		const defaultFilesFolder = 'src/files';
		const defaultSandboxFolder = 'src/sandbox';
		const defaultPrototypesFolder = 'src/prototypes';
		const defaultPort = 3000;

		const envPath = path.join(this.path, this.envFilename);
		const envConfig = dotenv.config({ path: envPath });
		const env = envConfig.parsed;

		if (envConfig.error) {
			console.reportError(`Error loading ${envPath} file:`, envConfig.error);
			process.exit(1);
		}

		(function loadPrototypes() {
			try {
				looseSet('prototypesFolder', loadEnvPath(env.prototypes_folder, defaultPrototypesFolder));
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
		global.listenEvents = env.listen_events ? env.listen_events.toLowerCase() === 'true' : true;
		global.reportEvents = env.report_events ? env.report_events.toLowerCase() === 'true' : true;
		global.eventsFolder = loadEnvPath(env.events_folder, defaultEventsFolder);

		global.listenEndpoints = env.listen_endpoints ? env.listen_endpoints.toLowerCase() === 'true' : true;
		global.reportEndpoints = env.report_endpoints ? env.report_endpoints.toLowerCase() === 'true' : true;
		global.endpointsFolder = loadEnvPath(env.endpoints_folder, defaultEndpointsFolder);

		global.commandsFolder = loadEnvPath(env.commands_folder, defaultCommandsFolder);
		global.filesFolder = loadEnvPath(env.files_folder, defaultFilesFolder);
		global.sandboxFolder = loadEnvPath(env.sandbox_folder, defaultSandboxFolder);

		global.apiEnable = env.api_enable ? env.api_enable.toLowerCase() === 'true' : false;
		global.apiPort = env.api_port ? validPort(env.api_port) ? env.api_port : defaultPort : defaultPort;
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

		global.dev = env.dev ? env.dev.toLowerCase() === 'true' : false;

		console.report('Config loaded');
	}
}

module.exports = ConfigManager;
