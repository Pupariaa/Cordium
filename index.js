'use strict';

const fs = require('fs');
const path = require('path');
const { Client, Events, GatewayIntentBits, Partials } = require('discord.js');

// Must haves ASAP

global.projectRoot = __dirname;
global.utilsPath = path.join(global.projectRoot, 'internals', 'Utils.js');
const { set, walkDirSync, toCamelCase, setReportFunctions } = require(global.utilsPath);

// Nice to have, avoids path.join with relative paths everywhere

(async function initGlobalPaths() {
	walkDirSync(path.join(global.projectRoot, 'internals'), function (filePath, stats) {
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

		// Collections

		// global.client.invitesCache = new Map();
		// global.databaseCache = {};
		global.sigintSubscribers = [];
		global.configManagers = [];

		// Config

		const { DefaultConfigManager } = require(global.defaultConfigManagerPath);
		global.defaultConfigManager = new DefaultConfigManager();
		await global.defaultConfigManager.loadAll();
		await global.defaultConfigManager.watchAll();

		// mkdir gitignored folders

		global.cacheFolder = path.join(global.projectRoot, 'internals', 'cache');
		if (!fs.existsSync(global.cacheFolder)) fs.mkdirSync(global.cacheFolder);
		if (!fs.existsSync(global.filesFolder)) fs.mkdirSync(global.filesFolder);
		if (!fs.existsSync(global.sandboxFolder)) fs.mkdirSync(global.sandboxFolder);

		// Prototypes

		[path.join(global.projectRoot, 'internals/prototypes'), global.prototypesFolder].forEach(folder => {
			if (!fs.existsSync(folder)) {
				fs.mkdirSync(folder);
				return;
			}
			fs.readdirSync(folder).forEach((filename) => {
				const filePath = path.join(folder, filename);
				// delete require.cache[require.resolve(filePath)];
				require(filePath);
			});
		});

		// Discord

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

		const { Channels } = require(global.channelsPath);
		global.channels = new Channels();

		// Managers

		const { CommandsManager } = require(global.commandsManagerPath);
		global.commandsManager = new CommandsManager();

		const { EventsManager } = require(global.eventsManagerPath);
		global.eventsManager = new EventsManager();

		const { EndpointsManager } = require(global.endpointsManagerPath);
		global.endpointsManager = new EndpointsManager();

		const AttachmentsManager = require(global.attachmentsManagerPath);
		global.attachmentsManager = new AttachmentsManager();
		global.saveAttachments = process.env.save_attachments === 'true';

		const RedisManager = require(global.redisManagerPath);
		global.redisManager = new RedisManager();

		const CacheManager = require(global.cacheManagerPath);
		global.cache = new CacheManager();

		const MessagesCache = require(global.messagesCachePath);
		global.messagesCache = new MessagesCache();

		// Databases

		// const EventsDatabase = require(global.eventsDatabasePath);
		// global.eventsDatabase = new EventsDatabase();

		// const MessagesDatabase = require(global.messagesDatabasePath);
		// global.messagesDatabase = new MessagesDatabase();

		// TODO:
		// require(global.getDatabasePath);
	}

	// just for pretty error hihi
	try {
		await initGlobal();
	} catch (err) {
		console.reportError(err);
		process.exit(1);
	}

	async function onReady() {
		console.report('Client ready');

		// Get guild
		global.guild = global.client.guilds.cache.get(global.discordGuildId);
		if (!global.guild) {
			console.reportError(`Guild of id ${global.discordGuildId} not found`);
			process.exit(1);
		}

		// Init Redis cache
		try {
			await global.redisManager.init();
		} catch (err) {
			console.reportWarn('Redis init failed, continuing without cache');
		}

		// Restore messages from Redis to Discord.js cache
		if (global.redisOnline && global.messagesCache) {
			await global.messagesCache.restoreToDiscordCache();
		}

		// Init databases
		// await Promise.all([global.eventsDatabase.init(), global.messagesDatabase.init()]);
		// await global.messagesDatabase.init();

		// Feed discord.js with old messages
		// console.report('Feeding Discord.js old messages...');
		// await global.messagesDatabase.feedDiscordjs();
		// console.report('Done feeding Discord.js old messages');

		// Init caches
		// const invites = await global.guild.invites.fetch();
		// invites.forEach((invite) => global.client.invitesCache.set(invite.code, invite.uses));
		global.channels.initCache();
		global.attachmentsManager.loadIndex();

		if (global.listenEvents) {
			console.report('Dispatching events...');
			await global.eventsManager.init();
			await global.eventsManager.loadAll();
			if (global.dev) {
				global.eventsManager.watchAll();
			}
		}

		if (global.listenEndpoints) {
			console.report('Dispatching endpoints...');
			await global.endpointsManager.loadAll();
			if (global.dev) {
				global.endpointsManager.watchAll();
			}
		}

		console.report('Dispatching commands...');
		await global.commandsManager.loadAll();
		await global.commandsManager.deployAll();
		if (global.dev) {
			global.commandsManager.watchAll();
		}

		// Interaction handler
		try {
			global.client.on(Events.InteractionCreate, async (interaction) => {
				if (interaction.isChatInputCommand()) {
					const command = global.commandsManager.loaded.get(interaction.commandName);
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
				} else if (interaction.isButton()) {
					const parts = interaction.customId.split('-');
					const commandName = parts[0];
					const buttonId = parts[1];
					const command = global.commandsManager.loaded.get(commandName);

					if (!command) {
						return interaction.reply({
							ephemeral: true,
							content: 'This button is from an older version. Please run the command again.',
						});
					}

					if (!command.buttons || !command.buttons[buttonId]) {
						return interaction.reply({
							ephemeral: true,
							content: 'This button is no longer available. Please run the command again.',
						});
					}

					return command.buttons[buttonId].execute(interaction);
				}
			});
		} catch (err) {
			console.reportError(err);
		}
	}

	async function dispatchHandlers() {
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
	}

	// just for pretty error again hihi
	try {
		await dispatchHandlers();
	} catch (err) {
		console.reportError(err);
		process.exit(1);
	}

	// Login client
	await global.client.login(global.clientToken);

	// Execute the user's index once the client is logged in

	const { FilesManager } = require(global.filesManagerPath);

	class IndexManager extends FilesManager {
		constructor() {
			super([path.join(global.projectRoot, 'src/index.js')]);
		}

		async _load(file, reloading) {
			try {
				const { init, body } = require(file);
				if (!reloading) {
					try { await init(); } catch (err) { console.reportError(`failed to init ${file}:`, err); }
				}
				try { await body(); } catch (err) { console.reportError(`failed to run ${file}:`, err); }
				return [true, body];
			} catch (err) {
				console.reportError(`failed to load ${file}:`, err);
				return [false, null];
			}
		}

		_unload(file) {
			delete require.cache[require.resolve(file)];
		}
	}

	global.indexManager = new IndexManager();
	global.indexManager.loadAll().then(() => {
		global.indexManager.watchAll();
	});
});
