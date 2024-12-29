'use strict';

const path = require('path');
const { ConfigManager } = require(global.configManagerPath);

// function transformValue(p) {
// 	return path.join(global.projectRoot, p);
// }

const myConfig = {
	downloads_folder: { required: true }
};

class MyConfigManager extends ConfigManager {
	constructor() {
		super(path.join(global.projectRoot, 'src/config/config.env'), myConfig);
	}
}

module.exports = {
	MyConfigManager,
};

const myConfigManager = new MyConfigManager();
myConfigManager.loadAll()
	.then(() => {
		myConfigManager.watchAll();
	});
global.configManagers.push(myConfigManager);
