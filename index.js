'use strict';

const fs = require('fs');
const path = require('path');

const prototypesDir = './internals/prototypes';

require(`${prototypesDir}/Logs`);
const { __cfn, __cf } = eval(require(`current_filename`));

fs.readdirSync(prototypesDir)
    .filter(filename => filename !== 'Logs.js')
    .forEach(filename => require('./' + path.join(prototypesDir, filename)));

const { report, reportWarn, reportError } = console.createReports(__cfn);

require('puparia.getlines.js');
require('dotenv').config({ path: './config/config.env' });
const { Events } = require('discord.js');
const CQD = require('./internals/CQD');

new CQD();

// Global error handling
process.on('uncaughtException', (err) => {
    reportError(__line, 'uncaughtException', 'Uncaught exception occurred:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    reportError(__line, 'unhandledRejection', 'Unhandled rejection at', promise, 'reason:', reason instanceof Error ? reason.message : reason);
});

const eventClientReady = Events.ClientReady;

global.client.on(eventClientReady, async () => {
    try {
        report(__line, eventClientReady, `Client ready`);
        require('./internals/api/API');
        // Initialize invite cache
        global.client.invitesCache = new Map();
        report('yusgvzfh')

        // Get guild
        global.guild = global.client.guilds.cache.get(process.env.discord_guild_id);
        if (!global.guild) {
            reportError(__line, eventClientReady, 'Guild not found. Check the "discord_guild_id" in config.env');
            process.exit(1);
        }
        global.initCount = (await global.guild.latestAuditLog())?.extra?.count || 0;
        global.utcdiff = parseInt(process.env.UTCdiff * 60 * 60 * 1000);

        // Events
        require('./internals/Events');
        
        const invites = await global.guild.invites.fetch();
        invites.forEach(invite => global.client.invitesCache.set(invite.code, invite.uses));
        report(__line, eventClientReady, 'Invites cache initialized');

        // Interaction handler
        const eventInteractionCreate = Events.InteractionCreate;
        global.client.on(eventInteractionCreate, async (interaction) => {
            if (!interaction.isChatInputCommand()) return;

            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) {
                await interaction.reply('Not a command');
                reportError(__line, eventInteractionCreate, `No command matching ${interaction.commandName} was found`);
                return;
            }

            try {
                await command.execute(interaction);
                report(__line, eventInteractionCreate, `Executed command ${interaction.commandName} successfully`);
            } catch (err) {
                reportError(__line, eventInteractionCreate, `Error executing command ${interaction.commandName}:`, err);
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
