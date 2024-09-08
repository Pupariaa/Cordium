'use strict';
const { SlashCommandBuilder } = require('discord.js');
require('puparia.getlines.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription(`ping the bot`),

    /**
     * Executes the 'ping' command.
     * @param {Object} interaction - The interaction object from Discord.js.
     */
    async execute(interaction) {
        const functionName = 'execute';
        try {
            await interaction.reply('pong')
        } catch (err) {
            console.error(`${__filename} - Line ${__line} (${functionName}): Error executing command:`, err);
        }
    }
};
