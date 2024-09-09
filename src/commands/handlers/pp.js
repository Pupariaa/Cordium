'use strict';
const { SlashCommandBuilder } = require('discord.js');
require('puparia.getlines.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pp')
        .setDescription(`send the given user's profile pictures`)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('the user whose profile pictures you want to get')
        ),

    /**
     * Executes the 'pp' command.
     * @param {Object} interaction - The interaction object from Discord.js.
     */
    async execute(interaction) {
        const functionName = 'execute';
        try {
            const user = interaction.options.getUser('user');
            await interaction.reply({
                ephemeral: false,
                content: `global profile picture: ${user.avatarURL()}\nthis server's profile picture: ${user.displayAvatarURL()}`
            });
        } catch (err) {
            console.error(`${__filename} - Line ${__line} (${functionName}): `, err);
        }
    }
};
