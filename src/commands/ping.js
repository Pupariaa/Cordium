'use strict';
const { SlashCommandBuilder } = require('discord.js');
require('puparia.getlines.js');

const { __cfn, __cf } = eval(require(`current_filename`));
const { report, reportWarn, reportError } = console.createReports(__cf);

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
            await interaction.reply(`pong (${Math.round((interaction.createdTimestamp - Date.now())/1000)}ms)`);
        } catch (err) {
            reportError(__line, functionName, err);
        }
    }
};
