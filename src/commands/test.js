'use strict';
const { SlashCommandBuilder } = require('discord.js');

const wait = require('node:timers/promises').setTimeout;

const cmdName = 'test';
const cmdDescription = 'test';

module.exports = {
    data: new SlashCommandBuilder()
        .setName(cmdName)
        .setDescription(cmdDescription),

    /**
     * Executes the 'test' command.
     * @param {Object} interaction - The interaction object from Discord.js.
     */
    async execute(interaction) {
        try {

            await interaction.reply({
                ephemeral: true,
                content: 'done'
            });

            await wait(1000);

            interaction.deleteReply();
        } catch (err) {
            console.reportError(err);
        }
    }
};
