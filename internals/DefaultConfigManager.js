'use strict';

const path = require('path');
const { validPort, setReportFunctions } = require(global.utilsPath);
const { ConfigManager } = require(global.configManagerPath);

function transformValue(p) {
	return path.join(global.projectRoot, p);
}

const defaultConfig = {
	prototypes_folder: { defaultValue: 'src/prototypes', transformValue: transformValue },

	client_token: { required: true },
	client_id: { required: true },
	discord_guild_id: { required: true },
	
	listen_events: { type: 'bool', defaultValue: true },
	report_events: { type: 'bool', defaultValue: true },
	events_folder: { defaultValue: 'src/events', transformValue },
	
	listen_endpoints: { type: 'bool', defaultValue: true },
	report_endpoints: { type: 'bool', defaultValue: true },
	endpoints_folder: { defaultValue: 'src/endpoints', transformValue },
	
	commands_folder: { defaultValue: 'src/commands', transformValue },
	files_folder: { defaultValue: 'src/files', transformValue },
	sandbox_folder: { defaultValue: 'src/sandbox', transformValue },
	
	api_port: { type: 'int', defaultValue: 3000, validate: validPort },
	timezone: { defaultValue: 'UTC' },
	locale: { defaultValue: 'en-US' },
	
	dev: { type: 'bool', defaultValue: false },
};

class DefaultConfigManager extends ConfigManager {
	constructor() {
		super(path.join(global.projectRoot, 'config/config.env'), defaultConfig);
	}

	_reload(file) {
		super._reload(file);
		setReportFunctions();
	}
}

module.exports = {
	DefaultConfigManager,
};
