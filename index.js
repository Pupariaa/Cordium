'use strict';

const fs = require('fs');
const path = require('path');
const { Client, Events, GatewayIntentBits, Partials } = require('discord.js');

// Fix discord.js inconsistencies
Object.keys(Events).forEach((key) => {
	Events[key] = key;
});

// Must haves
global.projectRoot = __dirname;
global.utilsPath = path.join(global.projectRoot, 'internals', 'Utils.js');
const { set, walkDirSync, toCamelCase, loadEnvPath, getOrNull, setReportFunctions } = require(global.utilsPath);

// Nice to have, avoids path.join with relative paths everywhere
(async function initGlobalPaths() {
	return walkDirSync(path.join(global.projectRoot, 'internals'), function (filePath, stats) {
		if (!stats.isFile() || path.extname(filePath) !== '.js') return;
		const propertyName = toCamelCase(path.basename(filePath, '.js')) + 'Path';
		if (propertyName in global) return;
		set(global, propertyName, filePath);
	});
})().then(async () => {

	// Now the index.js can start

	global.originalConsole = { ...console }; // must run once
	setReportFunctions();

	async function initGlobal() {
		// Load config
		const { ConfigManager } = require(global.configManagerPath);
		global.configManager = new ConfigManager();
		configManager.load();
		if (global.dev) {
			configManager.watch();
		}

		// mkdir gitignored folders
		global.cacheFolder = path.join(global.projectRoot, 'internals', 'cache');
		if (!fs.existsSync(global.cacheFolder)) fs.mkdirSync(global.cacheFolder);
		if (!fs.existsSync(global.filesFolder)) fs.mkdirSync(global.filesFolder);
		if (!fs.existsSync(global.sandboxFolder)) fs.mkdirSync(global.sandboxFolder);

		// Empty collections
		// global.client.invitesCache = new Map();
		// global.databaseCache = {};
		global.sigintSubscribers = [];

		// Create global modules
		global.client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildModeration,
				// GatewayIntentBits.GuildBans, // deprecated
				GatewayIntentBits.GuildEmojisAndStickers,
				GatewayIntentBits.GuildIntegrations,
				GatewayIntentBits.GuildWebhooks,
				GatewayIntentBits.GuildInvites,
				GatewayIntentBits.GuildVoiceStates,
				GatewayIntentBits.GuildPresences,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildMessageReactions,
				GatewayIntentBits.GuildMessageTyping,
				GatewayIntentBits.DirectMessages,
				GatewayIntentBits.DirectMessageReactions,
				GatewayIntentBits.DirectMessageTyping,
				GatewayIntentBits.MessageContent,
				GatewayIntentBits.GuildScheduledEvents,
				GatewayIntentBits.AutoModerationConfiguration,
				GatewayIntentBits.AutoModerationExecution,
				GatewayIntentBits.GuildMessagePolls,
				GatewayIntentBits.DirectMessagePolls
			], partials: [
				Partials.User,
				Partials.Channel,
				Partials.GuildMember,
				Partials.Message,
				Partials.Reaction,
				Partials.GuildScheduledEvent,
				Partials.ThreadMember
			]
		});

		const Channels = require(global.channelsPath);
		global.channels = new Channels();

		const { CommandsManager } = require(global.commandsManagerPath);
		global.commandsManager = new CommandsManager();

		const AttachmentsManager = require(global.attachmentsManagerPath);
		global.attachmentsManager = new AttachmentsManager();

		// const EventsDatabase = require(global.eventsDatabasePath);
		// global.eventsDatabase = new EventsDatabase();

		const MessagesDatabase = require(global.messagesDatabasePath);
		global.messagesDatabase = new MessagesDatabase();

		// TODO:
		// require(global.getDatabasePath);

		console.report('global modules created');
	}

	try {
		await initGlobal();
	} catch (err) {
		// just for pretty error hihi
		console.reportError(err);
		process.exit(1);
	}

	async function onReady() {
		console.report(`Client ready`);

		// Get guild
		global.guild = global.client.guilds.cache.get(global.discordGuildId);
		if (!global.guild) {
			console.reportError(`Guild of id ${global.discordGuildId} not found`);
			process.exit(1);
		}

		// Init databases
		// await Promise.all([global.eventsDatabase.init(), global.messagesDatabase.init()]);
		await global.messagesDatabase.init();

		// Feed discord.js with old messages
		console.report('Feeding Discord.js old messages...');
		await global.messagesDatabase.feedDiscordjs();
		console.report('Done feeding Discord.js old messages');

		// Init caches
		// const invites = await global.guild.invites.fetch();
		// invites.forEach((invite) => global.client.invitesCache.set(invite.code, invite.uses));
		global.channels.initCache();
		global.attachmentsManager.loadIndex();

		// Dispatch events
		if (global.listenEvents) {
			console.report('Dispatching events...');
			const { EventsManager } = require(global.eventsPath);
			global.eventsManager = new EventsManager();
			await global.eventsManager.init();
			global.eventsManager.listenAll();
			if (global.dev) {
				global.eventsManager.watch();
			}
		}

		// Load endpoints
		if (global.listenEndpoints) {
			const { EndpointsManager } = require(global.endpointsManagerPath);
			global.endpointsManager = new EndpointsManager();
			global.endpointsManager.loadAll();
			global.endpointsManager.listen();
			if (global.dev) {
				global.endpointsManager.watch();
			}
		}

		// Interaction handler
		try {
			global.client.on(Events.InteractionCreate, async (interaction) => {
				if (!interaction.isChatInputCommand()) return;

				const command = interaction.client.commands.get(interaction.commandName);
				if (!command) {
					return interaction.reply({
						ephemeral: true,
						content: 'Not a command',
					});
				}

				try {
					return command.execute(interaction);
				} catch (err) {
					console.reportError(err);
					return (interaction.replied || interaction.deferred ? interaction.followUp : interaction.reply)({
						ephemeral: true,
						content: `${interaction.commandName} failed (${err})`,
					});
				}
			});
		} catch (err) {
			console.reportError(err);
		}

		// Deploy commands
		global.commandsManager.loadAll();
		await global.commandsManager.deployAll();
		if (global.dev) {
			global.commandsManager.watch();
		}
	}

	(async function dispatchHandlers() {
		global.client.on(Events.ClientReady, onReady);

		process.on('uncaughtException', (err) => {
			console.reportError(err);
		});

		process.on('unhandledRejection', (reason, promise) => {
			console.reportError(promise, reason);
		});

		process.on('SIGINT', async () => {
			console.report('Closing...');
			try {
				await Promise.all(global.sigintSubscribers.map(async (subscriber) => await subscriber()));
			} catch (err) {
				console.reportError(err);
			}
			process.exit(0);
		});
	})();

	// Login client
	await global.client.login(global.clientToken);
});
