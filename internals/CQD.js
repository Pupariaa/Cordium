'use-strict'
const fs = require('fs');
const Discord = require('discord.js');
const CommandManager = require('./CommandManager');

const { __cfn, __cf } = eval(require(`current_filename`));
const { report, reportWarn, reportError } = console.createReports(__cfn);

function checkEnvVariables() {
    const functionName = 'checkEnvVariables';
    const requiredVars = ['client_token', 'client_id', 'discord_guild_id'];
    const missingVars = requiredVars.filter(v => !process.env[v]);

    if (missingVars.length > 0) {
        reportError(__line, functionName, 'Missing required environment variables:', ...missingVars);
        reportError(__line, functionName, 'cn init --token "yourToken" --id "yourClientID" --guid "yourGuildID" --rsrole "yourRestrictedRoleID');
        process.exit(1);
    }
}

report(__line, __cfn, process.env.prod ? 'Run in production' : 'Run is dev');

class CQD {
    constructor() {
        const functionName = 'constructor';
        try {
            checkEnvVariables();

            global.client = new Discord.Client({ intents: 3276799, partials: ['MESSAGE', 'REACTION'] });
            
            global.configChannels = JSON.parse(fs.readFileSync('./config/channels.json', 'utf-8'));
            global.configReportEvents = JSON.parse(fs.readFileSync('./config/reportEvents.json', 'utf-8'));
            global.reportEvents = process.env.report_events.toLowerCase() === 'true';
            require('./Channels');

            const EventsDatabase = require('./EventsDatabase');
            global.database_cache = {};
            
            global.eventsDatabase = new EventsDatabase();
            require('../internals/GetDatabase')

            const AttachmentManager = require('./AttachmentManager');

            global.attachment = new AttachmentManager();
            
            const commandManager = new CommandManager();
            commandManager.loadCommands();
            commandManager.deployCommands();

            global.client.login(process.env.client_token);
        } catch (err) {
            reportError(__line, functionName, err);
        }
    }
}

module.exports = CQD;