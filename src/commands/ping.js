'use strict';

const { SlashCommandBuilder } = require('discord.js');
const path = require('path');

const cmdName = path.basename(__filename, path.extname(__filename));
const cmdDescription = 'ping the bot';

module.exports = {
	data: new SlashCommandBuilder()
		.setName(cmdName)
		.setDescription(cmdDescription),

	async execute(interaction) {
		await interaction.reply(`pong (${Math.round((Date.now() - interaction.createdTimestamp) / 1000)}ms)`);
	}
};
