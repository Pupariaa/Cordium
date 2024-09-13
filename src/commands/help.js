'use strict';
const { SlashCommandBuilder } = require('discord.js');

const { __cfn, __cf } = eval(require(`current_filename`));
const { report, reportWarn, reportError } = console.createReports(__cf);

const cmdName = 'help';
const cmdDescription = 'gives an overview of the commands';

module.exports = {
    data: new SlashCommandBuilder()
        .setName(cmdName)
        .setDescription(cmdDescription),

    /**
     * Executes the 'help' command.
     * @param {Object} interaction - The interaction object from Discord.js.
     */
    async execute(interaction) {
        const functionName = 'execute';
        try {
            const replyObject = {
                ephemeral: false,
                content: ''
            };
            for (const cmd of global.client.commands.values()) {
                if (cmd.data.name !== cmdName && cmd.data.name !== 'test') {
                    replyObject.content += `${cmd.data.name} - ${cmd.data.description}\n`;
                }
            }
            await interaction.reply(replyObject);
        } catch (err) {
            reportError(__line, functionName, err);
        }
    }
};
