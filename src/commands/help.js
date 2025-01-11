'use strict';

const { SlashCommandBuilder } = require('discord.js');
const path = require('path');

const cmdName = path.basename(__filename, path.extname(__filename));
const cmdDescription = 'gives an overview of the commands';

module.exports = {
	data: new SlashCommandBuilder()
		.setName(cmdName)
		.setDescription(cmdDescription),

	async execute(interaction) {
		const replyObject = {
			ephemeral: false,
			content: ''
		};
		for (const cmd of global.commandsManager.loaded.values()) {
			if (cmd.data.name !== cmdName && cmd.data.name !== 'test') {
				replyObject.content += `${cmd.data.name} - ${cmd.data.description}\n`;
			}
		}
		await interaction.reply(replyObject);
	}
};
