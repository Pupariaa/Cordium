'use strict';

const path = require('path');
const { ConfigManager } = require(global.configManagerPath);

class MyConfigManager extends ConfigManager {
	constructor() {
		super(path.join(global.projectRoot, 'src/config/config.env'));
		this.load();
	}

	load() {
		this.loadRequiredStrings(['downloads_folder']);
		console.report('My config loaded');
	}
}

new MyConfigManager();
