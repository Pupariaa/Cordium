'use strict';

const path = require('path');
const { ConfigManager } = require(global.configManagerPath);

function transformValue(p) {
	return path.join(globa.projectRoot, p);
}

const myConfig = {
	downloads_folder: { required: true, transformValue }
};

class MyConfigManager extends ConfigManager {
	constructor() {
		super(path.join(global.projectRoot, 'src/config/config.env'), myConfig);
	}
}

module.exports = {
	MyConfigManager,
};


new MyConfigManager();
