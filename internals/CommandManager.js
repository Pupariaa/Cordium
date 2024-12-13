const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Collection } = require('discord.js');
const { Routes } = require('discord-api-types/v10');
const chokidar = require('chokidar');

class CommandHandler {
	constructor() {
		this.rest = new REST({ version: '10' }).setToken(global.clientToken);
		if (!global.client.commands) global.client.commands = new Collection();
	}

	load(filePath) {
		try {
			const command = require(filePath);
			if ('data' in command && 'execute' in command) {
				global.client.commands.set(command.data.name, command);
				console.report(`Command loaded: ${command.data.name}`);
			} else {
				console.reportWarn(`The command at ${filePath} is missing a required "data" or "execute" property`);
			}
		} catch (err) {
			console.reportError(`Error loading command from file ${filePath}:`, err);
		}
	}

	async deploy(filePath) {
		const command = require(filePath);
		const commands = [command.data.toJSON()];

		try {
			console.report(`Deploying command ${command.data.name}...`);
			await this.rest.put(
				Routes.applicationGuildCommands(global.clientId, global.discordGuildId),
				{ body: commands }
			);
			console.report(`Command deployed: ${command.data.name}`);
		} catch (err) {
			console.reportError(`Error deploying command from file ${filePath}:`, err);
		}
	}

	loadAll() {
		try {
			console.report('Loading all commands...');
			const commandFiles = fs.readdirSync(global.commandsFolder);
			for (const file of commandFiles) {
				const filePath = path.join(global.commandsFolder, file);
				this.load(filePath);
			}
			console.report('All commands loaded');
		} catch (err) {
			console.reportError('Error loading commands:', err);
		}
	}

	async deployAll() {
		const commands = [];

		global.client.commands.forEach(cmd => commands.push(cmd.data.toJSON()));

		try {
			console.report('Deploying all commands at once...');
			await this.rest.put(
				Routes.applicationGuildCommands(global.clientId, global.discordGuildId),
				{ body: commands }
			);
			console.report('All commands deployed');
		} catch (err) {
			console.reportError('Error deploying commands:', err);
		}
	}

	watch() {
		const watcher = chokidar.watch(global.commandsFolder, {
			persistent: true,
			ignored: /(^|[\/\\])\../,
			ignoreInitial: true,
		});

		watcher.on('add', this.onFileChange.bind(this));
		watcher.on('change', this.onFileChange.bind(this));
		console.report('Watching commands...');
	}

	onFileChange(filePath) {
		delete require.cache[require.resolve(filePath)];
		this.load(filePath);
		this.deploy(filePath);
	}

	reload() {
		try {
			for (const file of fs.readdirSync(global.commandsFolder)) {
				this.onFileChange(path.join(global.commandsFolder, file));
			}
		} catch (err) {
			console.reportError('Error reloading commands:', err);
		}
	}
}

module.exports = CommandHandler;
