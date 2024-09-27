'use strict';
const fs = require('fs');
const path = require('path');
const { Client, Events, GatewayIntentBits, Partials } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

// Must haves
global.projectRoot = __dirname;
require('dotenv').config({ path: path.join(global.projectRoot, 'config', 'config.env') });

// Fix discord.js inconsistencies
Object.keys(Events).forEach((key) => {
    Events[key] = key;
});

// Defaults for unspecified env variables
const defaultEndpointsFolder = './src/api/endpoints';
const defaultCommandsFolder = './src/commands';
const defaultEventsFolder = './src/events';
const defaultFilesFolder = './src/files';
const defaultPrototypesFolder = './src/prototypes';
const defaultSandboxFolder = './src/sandbox';
const defaultPort = 3000;

// Add logic to a default behavior
const { defaultLogFormat } = require('extend-console');

function extendLogFormat(logFormat) {
    return function (logContext, ...args) {
        if (logContext.filePath && (logContext.filePath.includes('internals') || logContext.filePath === __filename)) {
            const parts = logContext.filePath.split('.');
            logContext.filePath = parts.slice(0, parts.length - 1).join('.');
        }
        return logFormat(logContext, ...args);
    }
}

const oldCreateReport = console.createReport;
const oldCreateReportWarn = console.createReportWarn;
const oldCreateReportError = console.createReportError;

console.createReport = (...args) => args.length === 0 ? oldCreateReport(extendLogFormat(defaultLogFormat)) : oldCreateReport(extendLogFormat(args[0]), ...args.slice(1));
console.createReportWarn = (...args) => args.length === 0 ? oldCreateReportWarn(extendLogFormat(defaultLogFormat)) : oldCreateReportWarn(extendLogFormat(args[0]), ...args.slice(1));
console.createReportError = (...args) => args.length === 0 ? oldCreateReportError(extendLogFormat(defaultLogFormat)) : oldCreateReportError(extendLogFormat(args[0]), ...args.slice(1));

console.report = console.createReport();
console.reportWarn = console.createReportWarn();
console.reportError = console.createReportError();

// Must require now
global.utilsPath = path.join(global.projectRoot, 'internals', 'Utils.js');
const { validPort, capitalize, toCamelCase, getOrNull, loadEnvPath, walkDir } = require(global.utilsPath);

// Nice to have, avoids path.join with relative paths everywhere
(async function initGlobalPaths() {
    await walkDir(
        path.join(global.projectRoot, 'internals'),
        function (filePath, stats) {
            if (!stats.isFile() || path.extname(filePath) !== '.js') return;
            const propertyName = toCamelCase(path.basename(filePath, path.extname(filePath))) + 'Path';
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

    (function loadPrototypes() {
        try {
            const prototypesFolder = path.join(global.projectRoot, 'internals/prototypes');
            fs.readdirSync(prototypesFolder)
                .filter((filename) => filename !== 'Logs.js')
                .forEach((filename) => require(path.join(prototypesFolder, filename)));

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
            // Load configs
            const missingVars = [];
            for (const requiredVar of ['client_token', 'client_id', 'discord_guild_id']) {
                if (!process.env[requiredVar]) {
                    missingVars.push(requiredVar);
                } else if (missingVars.length === 0) {
                    Object.defineProperty(global, toCamelCase(requiredVar), {
                        value: process.env[requiredVar],
                        configurable: false,
                        enumerable: true,
                        writable: false,
                    });
                }
            }
            if (missingVars.length > 0) {
                console.reportError('Missing required environment variables:', ...missingVars);
                process.exit(1);
            }
            global.listenEvents = process.env.listen_events ? process.env.listen_events.toLowerCase() === 'true' : true;
            global.reportEvents = process.env.report_events ? process.env.report_events.toLowerCase() === 'true' : true;

            global.endpointsFolder = loadEnvPath('endpoints_folder', defaultEndpointsFolder);
            global.commandsFolder = loadEnvPath('commands_folder', defaultCommandsFolder);
            global.eventsFolder = loadEnvPath('events_folder', defaultEventsFolder);
            global.filesFolder = loadEnvPath('files_folder', defaultFilesFolder);
            global.sandboxFolder = loadEnvPath('sandbox_folder', defaultSandboxFolder);

            global.apiEnable = process.env.api_enable ? process.env.api_enable.toLowerCase() === 'true' : false;
            global.apiPort = process.env.api_port ? validPort(process.env.api_port) ? process.env.api_port : defaultPort : defaultPort;
            global.utcDiff = parseInt((process.env.utc_diff ? process.env.utc_diff : 0) * 60 * 60 * 1000);

            global.configChannels = JSON.parse(fs.readFileSync(path.join(global.projectRoot, 'config', 'channels.json'), 'utf-8'));
            if (Object.values(global.configChannels).every((channels) => Object.keys(channels).length === 0)) {
                console.reportWarn('No channels in config/channels.json.');
            }
            for (const basename of ['reportEvents', 'listenEvents']) {
                const filename = `${basename}.json`;
                const jsonPath = path.join(global.projectRoot, 'config', filename);
                const json = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
                Object.defineProperty(global, `config${capitalize(basename)}`, {
                    value: json,
                    configurable: false,
                    enumerable: true,
                    writable: false,
                });
                for (const eventName of Object.keys(Events)) {
                    if (!Object.keys(json).includes(eventName) && eventName !== Events.ClientReady) {
                        console.reportWarn(`Missing ${eventName} in ${filename}`);
                    }
                }
            }
            console.report('config files loaded');

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
            global.latestAuditLogCount = getOrNull(await global.guild.latestAuditLog(), 'extra.count'); // needed by VoiceStateUpdate
            require(global.eventsPath);

            // Load API
            require(global.apiPath);

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
            global.commandManager.loadCommands();
            await global.commandManager.deployCommands();
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
