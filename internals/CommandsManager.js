'use strict';

const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { FilesManager } = require(global.filesManagerPath);

function deployCommands(rest, commands) {
	return rest.put(
		Routes.applicationGuildCommands(global.clientId, global.discordGuildId),
		{ body: commands }
	).catch(err => {
		console.reportError('Error deploying commands:', err);
		throw err;
	});
}

class CommandsManager extends FilesManager {
	constructor() {
		super(fs.readdirSync(global.commandsFolder).map(file => path.resolve(path.join(global.commandsFolder, file))));
		this.rest = new REST({ version: '10' }).setToken(global.clientToken);
		this.deployedCommands = [];
	}

	_load(file) {
		try {
			const command = require(file);
			if (!(command?.data?.name)) {
				console.reportError(`Invalid command.data.name in ${file}: ${command?.data?.name}`);
				return [false, null];
			}
			if (typeof command?.execute !== 'function') {
				console.reportError(`Invalid typeof command.execute type in ${file}: ${typeof command.execute}`);
				return [false, null];
			}
			if (!command.buttons) {
				command.buttons = {};
			}
			if (typeof command.buttons !== 'object') {
				console.reportError(`Invalid typeof command.buttons type in ${file}: ${typeof command.buttons}`);
				return [false, null];
			}
			for (const [buttonId, button] of Object.entries(command.buttons)) {
				if (typeof button?.execute !== 'function') {
					console.reportError(`Invalid typeof command.buttons.${buttonId}.execute type in ${file}: ${typeof button.execute}`);
					return [false, null];
				}
				if (typeof button?.data !== "object") {
					console.reportError(`Invalid typeof command.buttons.${buttonId}.data type in ${file}: ${typeof button.data}`);
					return [false, null];
				}
				button.data.setCustomId(`${command.data.name}-${buttonId}`);
			}

			return [true, command];
		} catch (err) {
			console.reportError(`Error loading command from ${file}:`, err);
			return [false, null];
		}
	}

	async _unload(file, command, reloading) {
		delete require.cache[file];
		if (!reloading) {
			this.deployedCommands = await this._deployAll();
		}
	}

	async _reload() {
		this.deployedCommands = await this._deployAll();
	}

	reportLoadEnd(file) { console.report(`Command ${this.formatFile(file)} loaded`); }

	reportUnloadEnd(file) { console.report(`Command ${this.formatFile(file)} unloaded`); }

	reportReloadStart(file) { console.report(`Reloading command ${this.formatFile(file)}...`); }
	reportReloadEnd(file) { console.report(`Command ${this.formatFile(file)} reloaded`); }

	_deployAll() {
		return deployCommands(this.rest, Array.from(this.loaded.values()).map(cmd => cmd.data.toJSON()));
	}

	async deployAll() {
		console.report('Deploying all commands...');
		this.deployedCommands = await this._deployAll();
		console.report('All commands deployed');
	}

	async undeployAll() {
		console.report('Undeploying all commands...');
		await deployCommands(this.rest, []);
		this.deployedCommands = [];
		console.report('All commands undeployed');
	}
}

module.exports = {
	CommandsManager
};
