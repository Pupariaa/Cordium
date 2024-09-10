'use strict';

const fs = require('fs');
const path = require('path');

const prototypesDir = './internals/prototypes';
const prototypes = fs.readdirSync(prototypesDir).map(file => path.join('./', prototypesDir, file));

prototypes.forEach(proto => require('./' + String(proto)));

require('puparia.getlines.js');
require('dotenv').config({ path: './config/config.env' });
const { Events } = require('discord.js');
const CQD = require('./internals/CQD');

new CQD();

// Global error handling
process.on('uncaughtException', (err) => {
    console.error(`${__filename} - Line ${__line} (uncaughtException): Uncaught exception occurred.`, err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(`${__filename} - Line ${__line} (unhandledRejection): Unhandled rejection at`, promise, 'reason:', reason instanceof Error ? reason.message : reason);
});



global.client.on(Events.ClientReady, async () => {
    try {
        console.success(`START: Client connected`);
        require('./internals/api/API');
        // Initialize invite cache
        global.client.invitesCache = new Map();

        // Get guild
        global.guild = global.client.guilds.cache.get(process.env.discord_guid);
        if (!global.guild) {
            console.error(`START: Guild not found. Check the "discord_guid" in config.env.`);
            process.exit(1);
        }
        global.initCount = (await global.guild.latestAuditLog())?.extra?.count || 0;
        global.utcdiff = parseInt(process.env.UTCdiff * 60 * 60 * 1000);

        // Events
        require('./internals/Events');
        
        const invites = await global.guild.invites.fetch();
        invites.forEach(invite => global.client.invitesCache.set(invite.code, invite.uses));
        console.success(`START: Invites cache initialized.`);

        // Interaction handler
        global.client.on(Events.InteractionCreate, async (interaction) => {
            if (!interaction.isChatInputCommand()) return;

            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) {
                await interaction.reply('Not a command');
                console.error(`${__filename} - Line ${__line} (InteractionCreate): No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
                console.info(`${__filename} - Line ${__line} (InteractionCreate): Executed command ${interaction.commandName} successfully.`);
            } catch (error) {
                console.error(`${__filename} - Line ${__line} (InteractionCreate): Error executing command ${interaction.commandName}.`, error);
                const responseMessage = { content: 'There was an error while executing this command!', ephemeral: true };
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(responseMessage);
                } else {
                    await interaction.reply(responseMessage);
                }
            }
        });


    } catch (error) {
        console.error(`START: Error during bot initialization.`, error);
    }
});
