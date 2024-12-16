'use strict';

const fs = require('fs');
const path = require('path');
const { validPort } = require(global.utilsPath);
const { ConfigManager, setReportFunctions } = require(global.configManagerPath);

class DefaultConfigManager extends ConfigManager {
	constructor() {
		super(path.join(global.projectRoot, 'config/config.env'));
	}

	load() {
		[
			path.join(global.projectRoot, 'internals/prototypes'),
			this.loadEnvPath('prototypes_folder', 'src/prototypes')
		]
		.forEach(folder => {
			if (!fs.existsSync(folder)) {
				fs.mkdirSync(folder);
				return;
			}
			fs.readdirSync(folder).forEach((filename) => {
				const filePath = path.join(folder, filename);
				delete require.cache[require.resolve(filePath)];
				require(filePath);
			});
		});

		this.loadRequiredStrings(['client_token', 'client_id', 'discord_guild_id']);

		this.loadEnvBool('listen_events', true);
		this.loadEnvBool('report_events', true);
		this.loadEnvPath('events_folder', 'src/events');

		this.loadEnvBool('listen_endpoints', true);
		this.loadEnvBool('report_endpoints', true);
		this.loadEnvPath('endpoints_folder', 'src/endpoints');

		this.loadEnvPath('commands_folder', 'src/commands');
		this.loadEnvPath('files_folder', 'src/files');
		this.loadEnvPath('sandbox_folder', 'src/sandbox');

		this.loadEnvString('api_port', 3000, validPort);
		this.loadEnvString('timezone', 'UTC');
		this.loadEnvString('locale', 'en-US');

		this.loadEnvBool('dev', false);

		function validateChannels(file, filePath) {
			if (Object.values(file).every(channels => Object.keys(channels).length === 0)) {
				console.reportWarn(`No channels in ${filePath}`);
			}
			return true;
		}
		this.loadJsonConfig(path.join(global.projectRoot, `config/channels.json`), validateChannels);

		console.report('Default config loaded');
	}

	onChange() {
		this.load();
		setReportFunctions();
	}
}

module.exports = {
	DefaultConfigManager,
};
