'use strict';
const { SlashCommandBuilder } = require('discord.js');

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
        let hasReplied = false;
        try {
            await interaction.reply(`pong (${Math.round((Date.now() - interaction.createdTimestamp) / 1000)}ms)`);
            hasReplied = true;
        } catch (err) {
            console.reportError(err);

            await (hasReplied ? interaction.editReply : interaction.reply)({
                ephemeral: true,
                content: `${cmdName} failed`,
            });
        }
    }
};
