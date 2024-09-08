//@ts-check
'use strict';
require('puparia.getlines.js');
require('dotenv').config({ path: './config.env' });
const { Events } = require('discord.js');
const fs = require('fs');

const CQD = require('./src/common/Discord_instance');
new CQD();

// Global error handling
process.on('uncaughtException', (err) => {
    console.error(`${__filename} - Line ${__line} (uncaughtException): Uncaught exception occurred.`, err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(`${__filename} - Line ${__line} (unhandledRejection): Unhandled rejection at`, promise, 'reason:', reason instanceof Error ? reason.message : reason);
});

global.client.on('ready', async () => {
    try {
        // Event Loggers
        require('./eventsLoggers');
        console.success(`START: Client connected`);

        // Initialize invite cache
        global.client.invitesCache = new Map();

        // Get guild
        global.guild = global.client.guilds.cache.get(process.env.discord_guid);
        if (!global.guild) {
            console.error(`START: Guild not found. Check the "discord_guid" in config.env.`);
            process.exit(1);
        }
        
        const invites = await global.guild.invites.fetch();
        invites.forEach(invite => global.client.invitesCache.set(invite.code, invite.uses));
        console.success(`START: Invites cache initialized.`);

        // Load all event handlers
        [
            './src/common/Events/ChannelCreate',
            './src/common/Events/ChannelDelete',
            './src/common/Events/ChannelUpdate',

            './src/common/Events/GuildBanAdd',
            './src/common/Events/GuildBanRemove',

            './src/common/Events/GuildMemberAdd',
            './src/common/Events/GuildMemberRemove',

            './src/common/Events/GuildRoleCreate',
            './src/common/Events/GuildRoleDelete',
            './src/common/Events/GuildRoleUpdate',

            './src/common/Events/InteractionCreate',

            './src/common/Events/InviteCreate',
            './src/common/Events/InviteDelete',

            './src/common/Events/MessageCreate',
            './src/common/Events/MessageDelete',
            './src/common/Events/MessageUpdate',
            
            './src/common/Events/VoiceStateUpdate'
        ].forEach(eventPath => {
            try {
                require(eventPath);
                console.success(`START: Loaded event handler from ${eventPath}.`);
            } catch (error) {
                console.error(`START: Error loading event handler from ${eventPath}.`, error);
            }
        });

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
