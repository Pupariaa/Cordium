'use strict';

const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Collection } = require('discord.js');
const { Routes } = require('discord-api-types/v10');
const chokidar = require('chokidar');
const { walkDirSync } = require(global.utilsPath);
const { FilesManager } = require(global.filesManagerPath);

async function deployCommands(rest, commands, clientId, guildId) {
	try {
		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands }
		);
	} catch (err) {
		console.reportError('Error deploying commands:', err);
	}
}

async function undeployCommands(rest, commands, clientId, guildId) {
	try {
		const deletePromises = commands.map(command =>
			rest.delete(
				Routes.applicationGuildCommand(clientId, guildId, command.id)
			)
		);
		await Promise.all(deletePromises);
	} catch (err) {
		console.reportError('Error undeploying commands:', err);
	}
}

class CommandsManager extends FilesManager {
	constructor() {
		super(fs.readdirSync(global.commandsFolder).map(file => path.resolve(path.join(global.commandsFolder, file))));
		this.rest = new REST({ version: '10' }).setToken(global.clientToken);
	}

	_load(file) {
		const command = require(file);
		// TODO: improve this error checking
		if (!('data' in command) || !('execute' in command)) {
			console.reportWarn(`The command at ${file} is missing a required "data" and/or "execute" property`);
			return [ false, null ];
		}
		// do not deploy here to avoid spamming this.rest with requests when calling loadAll
		return [ true, command ];
	}

	reportLoad(file) {
		console.report(`Command loaded: ${this.formatFile(file)}`);
	}

	_unload(file, content) {
		this.undeploy(file);
		delete require.cache[file];
	}

	reportUnload(file) {
		console.report(`Command unloaded: ${this.formatFile(file)}`);
	}

	_reload(file) {
		this.deploy(file);
	}

	reportReload(file) {
		console.report(`Command reloaded: ${this.formatFile(file)}`);
	}

	deploy(file) { deployCommands(this.rest, [require(file).data.toJSON()], global.clientId, global.discordGuildId); }
	undeploy(file) { undeployCommands(this.rest, [require(file)], global.clientId, global.discordGuildId); }

	async deployAll() {
		const commands = Array.from(this.loaded.values()).map(cmd => cmd.data.toJSON());
		console.report('Deploying all commands...');
		await deployCommands(this.rest, commands, global.clientId, global.discordGuildId);
		console.report('All commands deployed');
	}

	async undeployAll() {
		console.report('Undeploying all commands...');
		const commands = await this.rest.get(
			Routes.applicationGuildCommands(global.clientId, global.discordGuildId)
		);
		await undeployCommands(this.rest, commands, global.clientId, global.discordGuildId);
		console.report('All commands undeployed');
	}
}

module.exports = {
	CommandsManager
};
