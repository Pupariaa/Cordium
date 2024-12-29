'use strict';

const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Collection } = require('discord.js');
const { Routes } = require('discord-api-types/v10');
const chokidar = require('chokidar');
const { walkDirSync } = require(global.utilsPath);
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
			if (!command?.data?.name || typeof command.execute !== 'function') {
				console.reportWarn(`Invalid command structure in ${file}`);
				return [false, null];
			}
			return [true, command];
		} catch (err) {
			console.reportError(`Error loading command from ${file}:`, err);
			return [false, null];
		}
	}

	reportLoad(file) {
		console.report(`Command loaded: ${this.formatFile(file)}`);
	}

	async _unload(file, content, reloading) {
		delete require.cache[file];
		if (!reloading) {
			this.deployedCommands = await this._deployAll();
		}
	}

	reportUnload(file) {
		console.report(`Command unloaded: ${this.formatFile(file)}`);
	}

	async _reload() {
		this.deployedCommands = await this._deployAll();
	}

	reportReload(file) {
		console.report(`Command reloaded: ${this.formatFile(file)}`);
	}

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
