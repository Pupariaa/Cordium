'use strict';
const { SlashCommandBuilder } = require('discord.js');

const { __cfn, __cf } = eval(require(`current_filename`));
const { report, reportWarn, reportError } = console.createReports(__cf);

const cmdName = 'pp';
const cmdDescription = 'send the given user\'s profile pictures';

module.exports = {
    data: new SlashCommandBuilder()
        .setName(cmdName)
        .setDescription(cmdDescription)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('the user whose profile pictures you want to get')
                .setRequired(false)
        )
        .addBooleanOption(option =>
            option.setName('guild')
                .setDescription('whether you want to get this server\'s icon')
                .setRequired(false)
        ),

    /**
     * Executes the 'pp' command.
     * @param {Object} interaction - The interaction object from Discord.js.
     */
    async execute(interaction) {
        const functionName = 'execute';
        try {
            const user = interaction.options.getUser('user');
            const getGuildPp = interaction.options.getBoolean('guild');
            let ephemeral = false;
            let content = '';
            if (user) content += `global profile picture: ${user.avatarURL()}\nthis server's profile picture: ${user.displayAvatarURL()}`;
            if (getGuildPp) content += `\n${global.guild.name}'s icon: ${global.guild.iconURL()}`;
            if (content.length === 0) {
                ephemeral = true;
                content = 'you must specify a user and/or this guild';
            }
            await interaction.reply({
                ephemeral: ephemeral,
                content: content
            });
        } catch (err) {
            reportError(__line, functionName, err);
        }
    }
};
