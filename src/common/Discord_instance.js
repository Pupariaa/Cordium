//@ts-check
'use-strict'
const fs = require('fs')
const path = require('path')
function getFormattedDate() {
    const date = new Date();
    const options = { timeZone: 'Europe/Paris', day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Intl.DateTimeFormat('fr-FR', options).format(date).replace(/\//g, '-');
}
function getFormattedTime() {
    const date = new Date();
    const options = { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Intl.DateTimeFormat('fr-FR', options).format(date);
}

const colors = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",

    FgBlack: "\x1b[30m",
    FgRed: "\x1b[31m",
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",
    FgWhite: "\x1b[37m",

    BgBlack: "\x1b[40m",
    BgRed: "\x1b[41m",
    BgGreen: "\x1b[42m",
    BgYellow: "\x1b[43m",
    BgBlue: "\x1b[44m",
    BgMagenta: "\x1b[45m",
    BgCyan: "\x1b[46m",
    BgWhite: "\x1b[47m"
};

const originalLog = console.log;
const originalInfo = console.info;
const originalError = console.error;
console.log = function (...args) {
    const formattedDate = getFormattedDate();
    const formattedTime = getFormattedTime();
    const logsDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }
    const logFilePath = path.join(logsDir, `${formattedDate}.log`);
    const message = `${formattedTime} LOG: ${args.join(':')}\n`;
    fs.appendFileSync(logFilePath, message, 'utf8');
    originalLog(colors.FgGreen, `[LOG]`, colors.Reset, ...args);
};

console.info = function (...args) {
    const formattedDate = getFormattedDate();
    const formattedTime = getFormattedTime();
    const logsDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }
    const logFilePath = path.join(logsDir, `${formattedDate}.log`);
    const message = `${formattedTime} INFO: ${args.join(':')}\n`;
    fs.appendFileSync(logFilePath, message, 'utf8');
    originalInfo(colors.FgCyan, `[INFO]`, colors.Reset, ...args);
};
console.error = function (...args) {
    const formattedDate = getFormattedDate();
    const formattedTime = getFormattedTime();
    const logsDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }
    const logFilePath = path.join(logsDir, `${formattedDate}.log`);
    const message = `${formattedTime} ERROR: ${args.join(':')}\n`;
    fs.appendFileSync(logFilePath, message, 'utf8');

    originalError(colors.FgRed, `[ERROR]`, colors.Reset, ...args);
};


const Discord = require('discord.js');
const CommandHandler = require('../commands/CommandManager');


/**
 * Class representing the CQD bot.
 */
class CQD {
    constructor() {
        /**
         * Instance of the Discord client.
         * @type {Discord.Client}
         */
        this.client = new Discord.Client({ intents: 3276799, partials: ['MESSAGE', 'REACTION'] });
        this.client.login(process.env.discord_cqd_token);
        this.instantiate();
    }

    /**
     * Method to instantiate and initialize various classes and global variables.
     * @returns {Discord.Client} - The initialized Discord client.
     */
    instantiate() {
        global.client = this.client;
        global.guild = this.client.guilds.cache.first();

        require('./Prototypes/GuildMember');
        require('./Prototypes/Client');
        require('./Exports/__discord');

        //Import triggers
        require('./Triggers/nameOfTrigger');

        const { Channels, Statics } = require('./Statics');
        
        global.Channel = new Channels();
        global.Statics = new Statics();

        const AttachmentManager = require('./AttachmentManager');
        global.attachment = new AttachmentManager();
        this.loadCommands();

        return this.client;
    }

    /**
     * Method to load commands.
     */
    loadCommands() {
        const commandHandler = new CommandHandler();
        commandHandler.loadCommands();
        commandHandler.deployCommands();
    }

}

module.exports = CQD;
