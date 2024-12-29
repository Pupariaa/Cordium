'use strict';

const path = require('path');
const { ConfigManager } = require(global.configManagerPath);

module.exports = {
	init: function () {
		const myConfig = {
			downloads_folder: { required: true }
		};

		class MyConfigManager extends ConfigManager {
			constructor() {
				super(path.join(global.projectRoot, 'src/config/config.env'), myConfig);
			}
		}

		const myConfigManager = new MyConfigManager();
		myConfigManager.loadAll()
			.then(() => {
				myConfigManager.watchAll();
				global.configManagers.push(myConfigManager);
			});
	},
	body: function () {
	}
}