'use strict';
const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

const cmdName = 'reload';
const cmdDescription = 'reload commands';

module.exports = {
	data: new SlashCommandBuilder()
		.setName(cmdName)
		.setDescription(cmdDescription),

	/**
	 * Executes the 'reload' command.
	 * @param {Object} interaction - The interaction object from Discord.js.
	 */
	async execute(interaction) {
		let hasReplied = false;
		try {
			global.commandManager.reloadCommands();

			await interaction.reply({
				ephemeral: true,
				content: 'done',
			});
			hasReplied = true;
		} catch (err) {
			console.reportError(err);

			await (hasReplied ? interaction.editReply : interaction.reply)({
				ephemeral: true,
				content: `${cmdName} failed`,
			});
		}
		await wait(5000);
		await interaction.deleteReply();
	}
};
