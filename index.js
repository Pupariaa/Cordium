'use strict';

const fs = require('fs');
const path = require('path');
const { Client, Events, GatewayIntentBits, Partials } = require('discord.js');

// Must haves ASAP

global.projectRoot = __dirname;
global.utilsPath = path.join(global.projectRoot, 'internals', 'Utils.js');
require(path.join(global.projectRoot, 'internals', 'ensureExtendConsoleJson.js')).ensureExtendConsoleJson(global.projectRoot);
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

		const { loadJsonConfig } = require(global.configManagerPath);
		const configJsonPath = path.join(global.projectRoot, 'config/config.json');
		const configJsonResult = loadJsonConfig(configJsonPath, { autoRoles: [] });
		if (configJsonResult && !global.configJson) {
			global.configJson = configJsonResult.content;
			if (global.configJson.autoRole && !global.configJson.autoRoles) {
				global.configJson.autoRoles = [global.configJson.autoRole];
				delete global.configJson.autoRole;
			}
			if (!global.configJson.autoRoles) {
				global.configJson.autoRoles = [];
			}
		}

		fs.watchFile(configJsonPath, { interval: 1000 }, () => {
			try {
				const content = fs.existsSync(configJsonPath) ? JSON.parse(fs.readFileSync(configJsonPath, 'utf8')) : { autoRoles: [] };
				if (content.autoRole && !content.autoRoles) {
					content.autoRoles = [content.autoRole];
					delete content.autoRole;
				}
				if (!content.autoRoles) {
					content.autoRoles = [];
				}
				global.configJson = content;
			} catch (err) {
				console.reportError('Error reloading config.json:', err);
			}
		});

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

		const EventsDatabase = require(global.eventsDatabasePath);
		global.eventsDatabase = new EventsDatabase();

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

	global.guild = null;
	global.guildUnavailable = false;
	global.guildUnavailableReason = null;

	async function onReady() {
		console.report('Client ready');

		try {
			if (global.discordGuildId) {
				global.guild = global.client.guilds.cache.get(global.discordGuildId) ||
					await global.client.guilds.fetch(global.discordGuildId);
			}
		} catch (err) {
			console.reportError(`Failed to fetch guild ${global.discordGuildId}:`, err);
		}

		if (!global.guild) {
			const reason = global.discordGuildId
				? `Guild "${global.discordGuildId}" not found or bot is not a member.`
				: 'discord_guild_id is not configured.';
			global.guildUnavailable = true;
			global.guildUnavailableReason = reason;
			console.reportWarn(`${reason} Running in limited mode. Update the configuration or invite the bot, then restart.`);
			return;
		}

		global.guildUnavailable = false;
		global.guildUnavailableReason = null;

		// Init Redis cache
		try {
			await global.redisManager.init();
		} catch (err) {
			console.reportWarn('Redis init failed, continuing without cache');
		}

		// Restore messages cache (Redis or load from Discord)
		if (global.messagesCache) {
			await global.messagesCache.restoreToDiscordCache();
		}

		if (global.eventsDatabase) {
			try {
				console.report('Initializing EventsDatabase...');
				await global.eventsDatabase.init();
				global.eventsDatabaseOnline = true;
				console.report('EventsDatabase initialized successfully');
			} catch (err) {
				console.reportError('EventsDatabase init failed:', err.message);
				console.error(err);
			}
		}

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
