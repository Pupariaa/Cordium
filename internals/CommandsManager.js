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

function undeployCommands(rest, commandIds) {
	return Promise.all(
		commandIds.map(id =>
			rest.delete(
				Routes.applicationGuildCommand(global.clientId, global.discordGuildId, id)
			)
		)
	).catch(err => {
		console.reportError('Error undeploying commands:', err);
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

	_unload(file, content) {
		delete require.cache[file];
		return this.undeployFromContent(content.data.toJSON());
	}

	reportUnload(file) {
		console.report(`Command unloaded: ${this.formatFile(file)}`);
	}

	_reload(file) {
		return this.deploy(file);
	}

	reportReload(file) {
		console.report(`Command reloaded: ${this.formatFile(file)}`);
	}

	deploy(file) { return this.deployFromContent(require(file).data.toJSON()); }
	async deployFromContent(content) {
		const newCommand = await deployCommands(this.rest, [content]);
		this.deployedCommands = [
			...this.deployedCommands.filter(cmd => !newCommand.some(newCmd => newCmd.id === cmd.id)),
			...newCommand
		];
	}
	undeploy(file) { return this.undeployFromContent(require(file).data.toJSON()); }
	undeployFromContent(content) {
		const commandToRemove = this.deployedCommands.find(cmd => cmd.name === content.name);
		if (!commandToRemove) {
			console.reportWarn(`Command with name "${content.name}" not found in deployed commands`);
			return Promise.resolve();
		}
		this.deployedCommands = this.deployedCommands.filter(cmd => cmd.name !== content.name);
		return undeployCommands(this.rest, [commandToRemove.id]);
	}

	async deployAll() {
		console.report('Deploying all commands...');
		this.deployedCommands = await deployCommands(this.rest, Array.from(this.loaded.values()).map(cmd => cmd.data.toJSON()));
		console.report('All commands deployed');
	}

	async undeployAll() {
		console.report('Undeploying all commands...');
		await undeployCommands(this.rest, Array.from(this.deployedCommands.values()).map(cmd => cmd.id));
		this.deployedCommands = [];
		console.report('All commands undeployed');
	}
}

module.exports = {
	CommandsManager
};
