'use strict';
const { SlashCommandBuilder } = require('discord.js');
require('puparia.getlines.js');

const cmdName = 'ping';
const cmdDescription = 'ping the bot';

module.exports = {
    data: new SlashCommandBuilder()
        .setName(cmdName)
        .setDescription(cmdDescription),

    /**
     * Executes the 'ping' command.
     * @param {Object} interaction - The interaction object from Discord.js.
     */
    async execute(interaction) {
        const functionName = 'execute';
        try {
            await interaction.reply('pong')
        } catch (err) {
            console.error(`${__filename} - Line ${__line} (${functionName}): `, err);
        }
    }
};
