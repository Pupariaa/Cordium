'use strict';

const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const path = require('path');

const cmdName = path.basename(__filename, path.extname(__filename));
const cmdDescription = 'test';

module.exports = {
	data: new SlashCommandBuilder()
		.setName(cmdName)
		.setDescription(cmdDescription),

	async execute(interaction) {
		const testButton = new ActionRowBuilder().addComponents(this.buttons.test_button.data);
		await interaction.reply({
			content: 'Test button',
			components: [testButton]
		});

		await interaction.reply({
			ephemeral: true,
			content: 'done'
		});
	},

	buttons: {
		test_button: {
			data: new ButtonBuilder().setLabel('❌').setStyle(ButtonStyle.Success),
			async execute(interaction) {
				console.log('button pressed', interaction.customId, this.data);
				interaction.reply({
					ephemeral: true,
					content: 'test button pressed',
				});
			}
		}
	}
};
