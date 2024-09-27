'use strict';
const { SlashCommandBuilder } = require('discord.js');

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
        try {
            let user = interaction.options.getUser('user');
            const getGuildPp = interaction.options.getBoolean('guild');
            let content = '';

            if (user || !getGuildPp) {
                if (!user) user = interaction.user;
                const member = await global.client.getMemberById(user.id);
                const userAvatarUrl = user.avatarURL();
                const memberAvatarUrl = member.displayAvatarURL();
                const name = member.displayName;
                content += `${name}'s user pp: ${userAvatarUrl}`;
                if (memberAvatarUrl !== userAvatarUrl) content += `\n${name}'s server pp: ${memberAvatarUrl}`;
            }

            if (getGuildPp) content += `\n${global.guild.name}'s icon: ${global.guild.iconURL()}`;

            await interaction.reply({
                ephemeral: false,
                content: content
            });
        } catch (err) {
            console.reportError(err);

            await (interaction.replied || interaction.deferred ? interaction.followUp : interaction.reply)({
                ephemeral: true,
                content: `${cmdName} failed`,
            });
        }
    }
};
