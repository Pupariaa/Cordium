'use strict';
const fs = require('fs');
const path = require('path');
const { Client, Events } = require('discord.js');

global.projectRoot = __dirname;

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

function convertFilePath(filename) {
    const basename = path.basename(filename, path.extname(filename));
    return (basename.charAt(0).toLowerCase() + basename.slice(1)).replace(/_(.)/g, (_, chr) => chr.toUpperCase()) + 'Path';
}

(async function initGlobalPaths() {
    await walkDir(path.join(global.projectRoot, 'internals'), function (filePath) {
        if (path.extname(filePath) !== '.js') return;
        const propertyName = convertFilePath(filePath);
        if (propertyName in global) {
            console.log(propertyName, 'already exists in global scope');
            return;
        }
        Object.defineProperty(global, propertyName, {
            value: filePath,
            configurable: false,
            enumerable: true,
            writable: false
        });
    });
})().then(async () => {

require(global.logsPath);
const { __cfn, __cf } = eval(require(`current_filename`));
const { report, reportWarn, reportError } = console.createReports(__cfn);

const { validPort } = require(global.utilsPath);

try {
    process.on('uncaughtException', (err) => {
        reportError(__line, 'uncaughtException', err);
    });

    process.on('unhandledRejection', (reason, promise) => {
        reportError(__line, 'unhandledRejection', promise, reason);
    });

    (function loadPrototypes() {
        const prototypesDir = './internals/prototypes';
        fs.readdirSync(prototypesDir)
            .filter(filename => filename !== 'Logs.js')
            .forEach(filename => require('./' + path.join(prototypesDir, filename)));

        const clientPrototypesDir = './src/prototypes';
        fs.readdirSync(clientPrototypesDir)
            .forEach(filename => require('./' + path.join(clientPrototypesDir, filename)));
    })();
} catch (err) {
    reportError(__line, 'initGlobal', err);
}

async function initGlobal() {
    const functionName = 'initGlobal';
    try {
        const defaultEventsFolder = './src/events';
        const defaultPort = 3000;

        // Load environment variables
        require('dotenv').config({ path: './config/config.env' });
        const requiredVars = ['client_token', 'client_id', 'discord_guild_id'];
        const missingVars = requiredVars.filter(v => !process.env[v]);
        if (missingVars.length > 0) {
            reportError(__line, functionName, 'Missing required environment variables:', ...missingVars);
            process.exit(1);
        }
        global.reportEvents = process.env.report_events ? process.env.report_events.toLowerCase() === 'true' : true;
        global.eventsFolder = process.env.events_folder ? (fs.existsSync(process.env.events_folder) ? process.env.events_folder : defaultEventsFolder) : defaultEventsFolder;
        global.apiEnable = process.env.api_enable ? process.env.api_enable.toLowerCase() === 'true' : false;
        global.apiPort = process.env.api_port ? (validPort(process.env.api_port) ? process.env.api_port : defaultPort) : defaultPort;

        // Load config files
        global.configChannels = JSON.parse(fs.readFileSync('./config/channels.json', 'utf-8'));
        if (Object.values(global.configChannels).every(channels => Object.keys(channels).length === 0)) {
            reportWarn(__line, functionName, 'No channels in config/channels.json.');
        }
        global.configReportEvents = JSON.parse(fs.readFileSync('./config/reportEvents.json', 'utf-8'));
        for (const eventName of Object.values(Events)) {
            if (!Object.keys(global.configReportEvents).includes(eventName) && eventName !== Events.ClientReady) {
                reportWarn(__line, functionName, `Missing ${eventName} in config/reportEvents.json`);
            }
        }

        // Load global modules
        const Channels = require(global.channelsPath);
        global.channels = new Channels();
        
        const AttachmentsManager = require(global.attachmentsManagerPath);
        global.attachments = new AttachmentsManager();

        // Login client
        global.client = new Client({ intents: 3276799, partials: ['MESSAGE', 'REACTION'] });
        await global.client.login(process.env.client_token);
        
        // Get guild
        global.guild = global.client.guilds.cache.get(process.env.discord_guild_id);
        if (!global.guild) {
            reportError(__line, functionName, 'Guild not found. Check the "discord_guild_id" in config.env');
            process.exit(1);
        }

        // Initialize databases
        const EventsDatabase = require(global.eventsDatabasePath);
        global.eventsDatabase = new EventsDatabase();
        await global.eventsDatabase.init();
        global.databaseCache = {};

        const MessagesDatabase = require(global.messagesDatabasePath);
        global.messagesDatabase = new MessagesDatabase();
        await global.messagesDatabase.init();

        // Miscellaneous
        global.client.invitesCache = new Map();
        global.initCount = (await global.guild.latestAuditLog())?.extra?.count || 0;
        global.utcDiff = parseInt((process.env.utc_diff ? process.env.utc_diff : 0) * 60 * 60 * 1000);

        // TODO
        // require(global.getDatabasePath);
    } catch (err) {
        reportError(__line, functionName, err);
    }
}

await initGlobal();

const event = Events.ClientReady;
global.client.on(event, async () => {
    try {
        report(__line, event, `Client ready`);

        // Initialize commands
        const CommandManager = require(global.commandManagerPath);
        const commandManager = new CommandManager();
        commandManager.loadCommands();
        commandManager.deployCommands();

        // Dispatch events
        require(global.eventsPath);

        // Initialize invites cache
        const invites = await global.guild.invites.fetch();
        invites.forEach(invite => global.client.invitesCache.set(invite.code, invite.uses));
        report(__line, event, 'Invites cache initialized');

        // Interaction handler
        global.client.on(Events.InteractionCreate, async (interaction) => {
            if (!interaction.isChatInputCommand()) return;

            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) {
                await interaction.reply({ content: 'Not a command', ephemeral: true });
                return;
            }

            try {
                await command.execute(interaction);
            } catch (err) {
                const responseMessage = { content: 'There was an error while executing this command!', ephemeral: true };
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(responseMessage);
                } else {
                    await interaction.reply(responseMessage);
                }
            }
        });

        // Start API
        require(global.apiPath);
    } catch (err) {
        reportError(__line, event, err);
    }
});

});