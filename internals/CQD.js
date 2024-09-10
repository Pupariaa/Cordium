'use-strict'
const fs = require('fs')
const path = require('path')
const Discord = require('discord.js');
const CommandManager = require('./CommandManager');
require('puparia.getlines.js');

function checkEnvVariables() {
    const requiredVars = ['discord_cqd_token', 'discord_cqd_cid', 'discord_guid'];
    const missingVars = requiredVars.filter(v => !process.env[v]);

    if (missingVars.length > 0) {
        console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
        console.error(`cn init --token "yourToken" --id "yourClientID" --guid "yourGuildID" --rsrole "yourRestrictedRoleID"`);

        process.exit(1);
    }
}

if (process.env.prod) {
    console.info('Run in production')
} else {
    console.info('Run is dev')
}

class CQD {
    constructor() {
        try {
            checkEnvVariables();

            global.client = new Discord.Client({ intents: 3276799, partials: ['MESSAGE', 'REACTION'] });
            global.configChannels = JSON.parse(fs.readFileSync('./config/channels.json', 'utf-8'));
            require('./Channels');

            // const Database = require('./internals/Database');
            // global.database = new Database();
            // const AttachmentManager = require('./AttachmentManager');

            // global.attachment = new AttachmentManager();
            
            const commandManager = new CommandManager();
            commandManager.loadCommands();
            commandManager.deployCommands();

            global.client.login(process.env.discord_cqd_token);
        } catch (err) {
            console.error(`${__filename} - Line ${__line} (constructor): `, err);
        }
    }
}

module.exports = CQD;