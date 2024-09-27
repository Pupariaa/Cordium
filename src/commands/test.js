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
        let hasReplied = false;
        try {

            await interaction.reply({
                ephemeral: true,
                content: 'done'
            });
            hasReplied = true;

            await wait(1000);

            interaction.deleteReply();
        } catch (err) {
            console.reportError(err);

            await (hasReplied ? interaction.editReply : interaction.reply)({
                ephemeral: true,
                content: `${cmdName} failed`,
            });
        }
    }
};
