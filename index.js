'use strict';

const fs = require('fs');
const path = require('path');
const { Client, Events, GatewayIntentBits, Partials } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

// Fix discord.js inconsistencies
Object.keys(Events).forEach((key) => {
	Events[key] = key;
});

// Must haves
global.projectRoot = __dirname;
global.utilsPath = path.join(global.projectRoot, 'internals', 'Utils.js');
const { walkDir, toCamelCase, loadEnvPath, getOrNull, setReportFunctions } = require(global.utilsPath);

// Nice to have, avoids path.join with relative paths everywhere
(async function initGlobalPaths() {
	await walkDir(
		path.join(global.projectRoot, 'internals'),
		function (filePath, stats) {
			if (!stats.isFile() || path.extname(filePath) !== '.js') return;
			const propertyName = toCamelCase(path.basename(filePath, '.js')) + 'Path';
			if (propertyName in global) return;
			Object.defineProperty(global, propertyName, {
				value: filePath,
				configurable: false,
				enumerable: true,
				writable: false,
			});
		}
	);
})().then(async () => {

	// Now the index.js can start

	global.originalConsole = { ...console }; // must run once
	setReportFunctions();

	(function loadPrototypes() {
		try {
			const prototypesFolder = path.join(global.projectRoot, 'internals/prototypes');
			fs.readdirSync(prototypesFolder)
				.filter((filename) => filename !== 'Logs.js')
				.forEach((filename) => require(path.join(prototypesFolder, filename)));

			const defaultPrototypesFolder = './src/prototypes';

			global.prototypesFolder = loadEnvPath('prototypes_folder', defaultPrototypesFolder);
			if (!fs.existsSync(global.prototypesFolder)) fs.mkdirSync(global.prototypesFolder);
			fs.readdirSync(global.prototypesFolder)
				.forEach((filename) => require(path.join(global.prototypesFolder, filename)));
		} catch (err) {
			console.reportError(err);
		}
	})();

	async function initGlobal() {
		try {
			// Load config
			const ConfigManager = require(global.configManagerPath);
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

			const CommandManager = require(global.commandManagerPath);
			global.commandManager = new CommandManager();

			const AttachmentsManager = require(global.attachmentsManagerPath);
			global.attachmentsManager = new AttachmentsManager();

			// const EventsDatabase = require(global.eventsDatabasePath);
			// global.eventsDatabase = new EventsDatabase();

			const MessagesDatabase = require(global.messagesDatabasePath);
			global.messagesDatabase = new MessagesDatabase();

			console.report('global modules created');

			// TODO:
			// require(global.getDatabasePath);
		} catch (err) {
			console.reportError(err);
		}
	}

	await initGlobal();

	async function onReady() {
		try {
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
			console.report('Dispatching events...');
			const { dispatchEvents } = require(global.eventsPath);
			dispatchEvents();

			// Load API
			if (global.apiEnable) {
				const { ApiManager } = require(global.apiManagerPath);
				global.apiManager = new ApiManager();
				global.apiManager.loadAll();
				global.apiManager.listen();
				if (global.dev) {
					global.apiManager.watch();
				}
			}

			// Interaction handler
			global.client.on(Events.InteractionCreate, async (interaction) => {
				if (!interaction.isChatInputCommand()) return;

				const command = interaction.client.commands.get(interaction.commandName);
				if (!command) {
					await interaction.reply({
						ephemeral: true,
						content: 'Not a command',
					});
					await wait(5000);
					await interaction.deleteReply();
					return;
				}

				try {
					await command.execute(interaction);
				} catch (err) {
					if (interaction) {
						await (interaction.replied || interaction.deferred ? interaction.followUp : interaction.reply)({
							ephemeral: true,
							content: `There was an error while executing the ${interaction.commandName} command`,
						});
					}
					console.reportError(err);
				}
			});

			// Deploy commands
			global.commandManager.loadAll();
			await global.commandManager.deployAll();
			if (global.dev) {
				global.commandManager.watch();
			}
		} catch (err) {
			console.reportError(err);
		}
	}

	(async function dispatchHandlers() {
		try {
			global.client.on(Events.ClientReady, onReady);

			process.on('uncaughtException', (err) => {
				console.reportError(err);
			});

			process.on('unhandledRejection', (reason, promise) => {
				console.reportError(promise, reason);
			});

			process.on('SIGINT', async () => {
				try {
					await Promise.all(global.sigintSubscribers.map(async (subscriber) => await subscriber()));
				} catch (err) {
					console.reportError(err);
				}
				process.exit(0);
			});
		} catch (err) {
			console.reportError(err);
		}
	})();

	// Login client
	await global.client.login(global.clientToken);
});
