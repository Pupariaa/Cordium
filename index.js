'use strict';
const fs = require('fs');
const path = require('path');
const { Events } = require('discord.js');

require('puparia.getlines.js');
require('dotenv').config({ path: './config/config.env' });
const { __cfn, __cf } = eval(require(`current_filename`));

global.projectRoot = __dirname;
global.utilsPath = __dirname + '/internals/prototypes/Utils';

const prototypesDir = './internals/prototypes';
require(`${prototypesDir}/Logs`);

const { report, reportWarn, reportError } = console.createReports(__cfn);

fs.readdirSync(prototypesDir)
    .filter(filename => filename !== 'Logs.js')
    .forEach(filename => require('./' + path.join(prototypesDir, filename)));

const CQD = require('./internals/CQD');
new CQD();

process.on('uncaughtException', (err) => {
    reportError(__line, 'uncaughtException', err);
});

process.on('unhandledRejection', (reason, promise) => {
    reportError(__line, 'unhandledRejection', promise, reason);
});

const eventClientReady = Events.ClientReady;

global.client.on(eventClientReady, async () => {
    try {
        report(__line, eventClientReady, `Client ready`);
        require('./internals/api/API');
        // Initialize invite cache
        global.client.invitesCache = new Map();

        // Get guild
        global.guild = global.client.guilds.cache.get(process.env.discord_guild_id);
        if (!global.guild) {
            reportError(__line, eventClientReady, 'Guild not found. Check the "discord_guild_id" in config.env');
            process.exit(1);
        }
        global.initCount = (await global.guild.latestAuditLog())?.extra?.count || 0;
        global.utc_diff = parseInt(process.env.utc_diff * 60 * 60 * 1000);

        // Initialize database
        const MessagesDatabase = require('./internals/MessagesDatabase');
        global.messagesDatabase = new MessagesDatabase();
        await global.messagesDatabase.init();

        // Events
        require('./internals/Events');

        // Initialize invites cache
        const invites = await global.guild.invites.fetch();
        invites.forEach(invite => global.client.invitesCache.set(invite.code, invite.uses));
        report(__line, eventClientReady, 'Invites cache initialized');

        // Interaction handler
        const eventInteractionCreate = Events.InteractionCreate;
        global.client.on(eventInteractionCreate, async (interaction) => {
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
    } catch (err) {
        reportError(__line, eventClientReady, 'Error during bot initialization:', err);
    }
});
