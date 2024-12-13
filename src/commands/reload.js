'use strict';

const { SlashCommandBuilder } = require('discord.js');
const path = require('path');

const cmdName = path.basename(__filename, path.extname(__filename));
const cmdDescription = 'reload commands';

module.exports = {
	data: new SlashCommandBuilder()
		.setName(cmdName)
		.setDescription(cmdDescription),

	async execute(interaction) {
		if (global.dev) {
			return interaction.reply({
				ephemeral: true,
				content: 'There is nothing to reload in dev mode',
			});
		}
		await interaction.reply({
			ephemeral: false,
			content: 'Reloading...'
		});
		const commandsPromise = global.commandsManager.reload();
		global.configManager.reload();
		if (global.listenEndpoints) {
			global.endpointsManager.reload();
		}
		if (global.listenEvents) {
			global.eventsManager.reload();
		}
		await commandsPromise;
		return interaction.editReply({
			ephemeral: true,
			content: 'done',
		});
	}
};
