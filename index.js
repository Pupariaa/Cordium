'use strict';
const fs = require('fs');
const path = require('path');
const { Client, Events } = require('discord.js');

// Fix discord.js inconsistencies
Object.keys(Events).forEach((key) => {
    Events[key] = key;
});

// Must haves
global.projectRoot = __dirname;
global.utilsPath = path.join(__dirname, 'internals', 'prototypes', 'Utils.js');
const configEnvPath = path.join(__dirname, 'config', 'config.env');
require('dotenv').config({ path: configEnvPath });

// Defaults for unspecified env variables
const defaultEndpointsFolder = './src/api/endpoints';
const defaultCommandsFolder = './src/commands';
const defaultEventsFolder = './src/events';
const defaultFilesFolder = './src/files';
const defaultPrototypesFolder = './src/prototypes';
const defaultSandboxFolder = './src/sandbox';
const defaultPort = 3000;

const { validPort, capitalize, toCamelCase, getOrNull, loadEnvPath } = require(global.utilsPath);

// Because apparently javascript doesn't have a built-in way to do this
async function walkDir(dirPath, callback) {
    const files = await fs.readdirSync(dirPath);
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.statSync(filePath);
        if (stats.isDirectory()) {
            await walkDir(filePath, callback);
        } else {
            callback(filePath);
        }
    }
}

// Nice to have, avoids path.join with relative paths everywhere
(async function initGlobalPaths() {
    await walkDir(
        path.join(global.projectRoot, 'internals'),
        function (filePath) {
            if (path.extname(filePath) !== '.js') return;
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
    require(global.logsPath);
    const { __cfn, __cf } = eval(require(`current_filename`));
    const { report, reportWarn, reportError } = console.createReports(__cfn);

    (function loadPrototypes() {
        const functionName = 'loadPrototypes';
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
            reportError(__line, functionName, err);
        }
    })();

    async function initGlobal() {
        const functionName = 'initGlobal';
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
                reportError(__line, functionName, 'Missing required environment variables:', ...missingVars);
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
                reportWarn(__line, functionName, 'No channels in config/channels.json.');
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
                        reportWarn(__line, functionName, `Missing ${eventName} in ${filename}`);
                    }
                }
            }
            report(__line, functionName, 'config files loaded');

            // mkdir gitignored folders
            global.cacheFolder = path.join(global.projectRoot, 'internals', 'cache');
            if (!fs.existsSync(global.cacheFolder)) fs.mkdirSync(global.cacheFolder);
            if (!fs.existsSync(global.filesFolder)) fs.mkdirSync(global.filesFolder);
            if (!fs.existsSync(global.sandboxFolder)) fs.mkdirSync(global.sandboxFolder);

            // Empty collections
            // global.client.invitesCache = new Map();
            global.databaseCache = {};
            global.sigintSubscribers = [];

            // Create global modules
            global.client = new Client({ intents: 3276799, partials: ['MESSAGE', 'REACTION'], });

            const Channels = require(global.channelsPath);
            global.channels = new Channels();

            const CommandManager = require(global.commandManagerPath);
            global.commandManager = new CommandManager();

            const AttachmentsManager = require(global.attachmentsManagerPath);
            global.attachmentsManager = new AttachmentsManager();

            const EventsDatabase = require(global.eventsDatabasePath);
            global.eventsDatabase = new EventsDatabase();

            const MessagesDatabase = require(global.messagesDatabasePath);
            global.messagesDatabase = new MessagesDatabase();

            report(__line, functionName, 'global modules created');

            // TODO:
            // require(global.getDatabasePath);
        } catch (err) {
            reportError(__line, functionName, err);
        }
    }

    await initGlobal();

    async function onReady() {
        const functionName = 'onReady';
        try {
            report(__line, functionName, `Client ready`);

            // Get guild
            global.guild = global.client.guilds.cache.get(global.discordGuildId);
            if (!global.guild) {
                reportError(__line, functionName, `Guild of id ${global.discordGuildId} not found`);
                process.exit(1);
            }

            // Init databases
            await Promise.all([global.eventsDatabase.init(), global.messagesDatabase.init()]);

            // Feed discord.js with old messages
            report(__line, functionName, 'Feeding Discord.js old messages...');
            await global.messagesDatabase.feedDiscordjs();
            report(__line, functionName, 'Done feeding Discord.js old messages');

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

                const command = interaction.client.commands.get(
                    interaction.commandName
                );
                if (!command) {
                    await interaction.reply({
                        content: 'Not a command',
                        ephemeral: true,
                    });
                    return;
                }

                try {
                    await command.execute(interaction);
                } catch (err) {
                    const responseMessage = {
                        content: 'There was an error while executing this command!',
                        ephemeral: true,
                    };
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp(responseMessage);
                    } else {
                        await interaction.reply(responseMessage);
                    }
                }
            });

            // Deploy commands
            global.commandManager.loadCommands();
            global.commandManager.deployCommands();
        } catch (err) {
            reportError(__line, functionName, err);
        }
    }

    (async function dispatchHandlers() {
        const functionName = 'dispatchHandlers';
        try {

            global.client.on(Events.ClientReady, onReady);

            process.on('uncaughtException', (err) => {
                reportError(__line, 'uncaughtException', err);
            });

            process.on('unhandledRejection', (reason, promise) => {
                reportError(__line, 'unhandledRejection', promise, reason);
            });

            process.on('SIGINT', async () => {
                try {
                    await Promise.all(global.sigintSubscribers.map(async (subscriber) => await subscriber()));
                } catch (err) {
                    reportError(__line, functionName, err);
                }
                process.exit(0);
            });
        } catch (err) {
            reportError(__line, functionName, err);
        }
    })();

    // Login client
    await global.client.login(global.clientToken);
});
