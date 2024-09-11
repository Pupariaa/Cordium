'use strict';
const { SlashCommandBuilder } = require('discord.js');
require('puparia.getlines.js');

const { __cfn, __cf } = eval(require(`current_filename`));
const { report, reportWarn, reportError } = console.createReports(__cf);

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
        const functionName = 'execute';
        try {

            await interaction.reply({
                ephemeral: true,
                content: 'done'
            });

            await wait(1000);

            interaction.deleteReply();
        } catch (err) {
            reportError(__cfn, functionName, err);
        }
    }
};
