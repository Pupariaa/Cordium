//@ts-check
'use strict';

require('dotenv').config({ path: './config.env' });
const { Events } = require('discord.js');
require('puparia.getlines.js');
const fs = require('fs');

const DiscordInstance = require('./src/common/Discord_instance');
new DiscordInstance();

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
        console.info(`${__filename} - Line ${__line} (ready): Discord bot is started.`);

        // Initialize invite cache
        global.client.invitesCache = new Map();
        const guild = global.client.guilds.cache.get(process.env.discord_guid);
        
        if (!guild) {
            console.error(`${__filename} - Line ${__line} (ready): Guild not found. Check the "discord_guid" in config.env.`);
            return;
        }
        const invites = await guild.invites.fetch();
        invites.forEach(invite => global.client.invitesCache.set(invite.code, invite.uses));
        global.guild = guild;
        console.info(`${__filename} - Line ${__line} (ready): Invites cache initialized.`);
        global.channels = JSON.parse(fs.readFileSync('channels.json', 'utf-8'));

        // Load all event handlers
        [
            './src/common/Events/MemberJoin',
            './src/common/Events/MemberLeft',
            './src/common/Events/Messages',
            './src/common/Events/ChannelCreate',
            './src/common/Events/ChannelUpdate',
            './src/common/Events/ChannelDelete',
            './src/common/Events/GuildBanAdd',
            './src/common/Events/InvitCreate',
            './src/common/Events/InvitDelete',
            './src/common/Events/MessageDelete',
            './src/common/Events/MessageUpdate',
            './src/common/Events/RoleCreate',
            './src/common/Events/RoleUpdate',
            './src/common/Events/Interactions',
            './src/common/Events/VoiceUpdate'
        ].forEach(eventPath => {
            try {
                require(eventPath);
                console.info(`${__filename} - Line ${__line} (ready): Loaded event handler from ${eventPath}.`);
            } catch (error) {
                console.error(`${__filename} - Line ${__line} (ready): Error loading event handler from ${eventPath}.`, error);
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
        console.error(`${__filename} - Line ${__line} (ready): Error during bot initialization.`, error);
    }
});
