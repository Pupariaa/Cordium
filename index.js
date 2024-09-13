'use strict';
const fs = require("fs");
const path = require("path");
const { Client, Events } = require("discord.js");

Object.keys(Events).forEach((key) => {
    Events[key] = key;
});

global.projectRoot = __dirname;
global.utilsPath = path.join(__dirname, "internals", "prototypes", "Utils.js");
const configEnvPath = path.join(__dirname, "config", "config.env");

const defaultCommandsFolder = "./src/commands";
const defaultEventsFolder = "./src/events";
const defaultEndpointsFolder = "./src/api/endpoints";
const defaultPort = 3000;

const {
    validPort,
    capitalize,
    toCamelCase,
    getOrNull,
} = require(global.utilsPath);

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

(async function initGlobalPaths() {
    await walkDir(
        path.join(global.projectRoot, "internals"),
        function (filePath) {
            if (path.extname(filePath) !== ".js") return;
            const propertyName =
                toCamelCase(path.basename(filePath, path.extname(filePath))) + "Path";
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
    require(global.logsPath);
    const { __cfn, __cf } = eval(require(`current_filename`));
    const { report, reportWarn, reportError } = console.createReports(__cfn);

    try {
        process.on("uncaughtException", (err) => {
            reportError(__line, "uncaughtException", err);
        });

        process.on("unhandledRejection", (reason, promise) => {
            reportError(__line, "unhandledRejection", promise, reason);
        });

        (function loadPrototypes() {
            const prototypesDir = "./internals/prototypes";
            fs.readdirSync(prototypesDir)
                .filter((filename) => filename !== "Logs.js")
                .forEach((filename) =>
                    require("./" + path.join(prototypesDir, filename))
                );

            const clientPrototypesDir = "./src/prototypes";
            fs.readdirSync(clientPrototypesDir).forEach((filename) =>
                require("./" + path.join(clientPrototypesDir, filename))
            );
        })();
    } catch (err) {
        reportError(__line, "initGlobal", err);
    }

    async function initGlobal() {
        const functionName = "initGlobal";
        try {
            // Load configs
            require("dotenv").config({ path: configEnvPath });
            const missingVars = [];
            for (const requiredVar of [
                "client_token",
                "client_id",
                "discord_guild_id",
            ]) {
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
                reportError(
                    __line,
                    functionName,
                    "Missing required environment variables:",
                    ...missingVars
                );
                process.exit(1);
            }
            global.listenEvents = process.env.listen_events
                ? process.env.listen_events.toLowerCase() === "true"
                : true;
            global.reportEvents = process.env.report_events
                ? process.env.report_events.toLowerCase() === "true"
                : true;
            global.eventsFolder = path.join(
                global.projectRoot,
                process.env.events_folder
                    ? fs.existsSync(process.env.events_folder)
                        ? process.env.events_folder
                        : defaultEventsFolder
                    : defaultEventsFolder
            );
            global.commandsFolder = path.join(
                global.projectRoot,
                process.env.commands_folder
                    ? fs.existsSync(process.env.commands_folder)
                        ? process.env.commands_folder
                        : defaultCommandsFolder
                    : defaultCommandsFolder
            );
            global.endpointsFolder = path.join(
                global.projectRoot,
                process.env.endpoints_folder
                    ? fs.existsSync(process.env.endpoints_folder)
                        ? process.env.endpoints_folder
                        : defaultEndpointsFolder
                    : defaultEndpointsFolder
            );
            global.apiEnable = process.env.api_enable
                ? process.env.api_enable.toLowerCase() === "true"
                : false;
            global.apiPort = process.env.api_port
                ? validPort(process.env.api_port)
                    ? process.env.api_port
                    : defaultPort
                : defaultPort;
            global.utcDiff = parseInt(
                (process.env.utc_diff ? process.env.utc_diff : 0) * 60 * 60 * 1000
            );

            global.configChannels = JSON.parse(
                fs.readFileSync("./config/channels.json", "utf-8")
            );
            if (
                Object.values(global.configChannels).every(
                    (channels) => Object.keys(channels).length === 0
                )
            ) {
                reportWarn(
                    __line,
                    functionName,
                    "No channels in config/channels.json."
                );
            }
            for (const basename of ["reportEvents", "listenEvents"]) {
                const filename = `${basename}.json`;
                const jsonPath = path.join(global.projectRoot, "config", filename);
                const json = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
                Object.defineProperty(global, `config${capitalize(basename)}`, {
                    value: json,
                    configurable: false,
                    enumerable: true,
                    writable: false,
                });
                for (const eventName of Object.keys(Events)) {
                    if (
                        !Object.keys(json).includes(eventName) &&
                        eventName !== Events.ClientReady
                    ) {
                        reportWarn(
                            __line,
                            functionName,
                            `Missing ${eventName} in ${filename}`
                        );
                    }
                }
            }
            report(__line, functionName, "config files loaded");

            // Create global modules
            global.client = new Client({
                intents: 3276799,
                partials: ["MESSAGE", "REACTION"],
            });

            const Channels = require(global.channelsPath);
            global.channels = new Channels();

            const CommandManager = require(global.commandManagerPath);
            global.commandManager = new CommandManager();

            const AttachmentsManager = require(global.attachmentsManagerPath);
            global.attachments = new AttachmentsManager();

            const EventsDatabase = require(global.eventsDatabasePath);
            global.eventsDatabase = new EventsDatabase();

            const MessagesDatabase = require(global.messagesDatabasePath);
            global.messagesDatabase = new MessagesDatabase();
            report(__line, functionName, "global modules created");

            // Create caches
            global.client.invitesCache = new Map();
            global.databaseCache = {};

            // TODO
            // require(global.getDatabasePath);
        } catch (err) {
            reportError(__line, functionName, err);
        }
    }

    await initGlobal();

    async function onReady() {
        const functionName = "onReady";
        try {
            report(__line, functionName, `Client ready`);

            // Get guild
            global.guild = global.client.guilds.cache.get(global.discordGuildId);
            if (!global.guild) {
                reportError(
                    __line,
                    functionName,
                    `Guild of id ${global.discordGuildId} not found`
                );
                process.exit(1);
            }

            // Init databases
            await Promise.all([
                global.eventsDatabase.init(),
                global.messagesDatabase.init(),
            ]);

            // Init invites cache
            const invites = await global.guild.invites.fetch();
            invites.forEach((invite) =>
                global.client.invitesCache.set(invite.code, invite.uses)
            );

            // Miscellaneous
            global.latestAuditLogCount = getOrNull(
                await global.guild.latestAuditLog(),
                "extra.count"
            );

            // Dispatch events
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
                        content: "Not a command",
                        ephemeral: true,
                    });
                    return;
                }

                try {
                    await command.execute(interaction);
                } catch (err) {
                    const responseMessage = {
                        content: "There was an error while executing this command!",
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

    // Login client
    const event = Events.ClientReady;
    global.client.on(event, onReady);
    await global.client.login(global.clientToken);
});
