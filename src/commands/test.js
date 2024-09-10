'use strict';
const { SlashCommandBuilder } = require('discord.js');
require('puparia.getlines.js');

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
            // const channel = await global.client.channels.fetch('1282726820336373904');
            // console.log(channel);

            await interaction.reply({
                ephemeral: true,
                content: 'done'
            });

            await wait(1000);

            interaction.deleteReply();
        } catch (err) {
            console.error(`${__filename} - Line ${__line} (${functionName}): `, err);
        }
    }
};
