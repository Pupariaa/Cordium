'use strict';

const { SlashCommandBuilder } = require('discord.js');
const path = require('path');

const cmdName = path.basename(__filename, path.extname(__filename));
const cmdDescription = 'test';

module.exports = {
	data: new SlashCommandBuilder()
		.setName(cmdName)
		.setDescription(cmdDescription),

	async execute(interaction) {
		await interaction.reply({
			ephemeral: true,
			content: 'done'
		});
	}
};
