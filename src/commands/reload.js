'use strict';

const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

const { loadConfig } = require(global.utilsPath);

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
		try {
			let replyMsg = 'done';
			if (global.dev) {
				replyMsg = 'There is nothing to reload in dev mode';
			} else {
				global.configManager.reload();
				if (global.listenEvents) {
					global.eventsManager.reload();
				}
				if (global.listenEndpoints) {
					await global.endpointsManager.reload();
				}
				await global.commandsManager.reload();
			}
			await interaction.reply({
				ephemeral: true,
				content: replyMsg,
			});
		} catch (err) {
			console.reportError(err);

			await (interaction.replied || interaction.deferred ? interaction.followUp : interaction.reply)({
				ephemeral: true,
				content: `${cmdName} failed`,
			});
		}
		await wait(5000);
		await interaction.deleteReply();
	}
};
