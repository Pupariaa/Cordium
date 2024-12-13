'use strict';

const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const path = require('path');

const cmdName = path.basename(__filename, path.extname(__filename));
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
		await interaction.reply({
			ephemeral: true,
			content: 'done'
		});

		await wait(1000);

		interaction.deleteReply();
	}
};
