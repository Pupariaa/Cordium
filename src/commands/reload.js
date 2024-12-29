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
		global.configManagers.forEach(configManager => configManager.reloadAll());
		const commandsPromise = global.commandsManager.reloadAll();
		if (global.listenEndpoints) {
			global.endpointsManager.reloadAll();
		}
		if (global.listenEvents) {
			global.eventsManager.reloadAll();
		}
		global.indexManager.reloadAll();
		await commandsPromise;
		return interaction.editReply({
			ephemeral: true,
			content: 'done',
		});
	}
};
