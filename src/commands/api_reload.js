'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { reloadAPI } = require(global.apiPath);

const cmdName = 'apireload';
const cmdDescription = 'Reload the API';

module.exports = {
	data: new SlashCommandBuilder()
		.setName(cmdName)
		.setDescription(cmdDescription),

	/**
	 * Executes the 'apireload' command.
	 * @param {Object} interaction - The interaction object from Discord.js.
	 */
	async execute(interaction) {
		try {
			await reloadAPI();
			await interaction.reply('The API has been reloaded with succesd');
		} catch (err) {
			await interaction.reply(`Error while reloading the API, see console for details`);
			console.reportError(err);
		}
	}
};
