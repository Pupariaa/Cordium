'use strict';

const { SlashCommandBuilder } = require('discord.js');
const path = require('path');

const cmdName = path.basename(__filename, path.extname(__filename));
const cmdDescription = 'send';

const { waitForFile } = require(global.utilsPath);

module.exports = {
	data: new SlashCommandBuilder()
		.setName(cmdName)
		.setDescription(cmdDescription)
		.addStringOption(option =>
			option.setName('channel_name')
				.setDescription('the channel to send the file to')
				.setRequired(true)
				.addChoices(global.channels.text.choices)
		)
		.addStringOption(option =>
			option.setName('file_path')
				.setDescription('the path of the file to send (relative to the downloadsFolder)')
				.setRequired(false)
		)
		.addStringOption(option =>
			option.setName('content')
				.setDescription('the content of the message')
				.setRequired(false)
		),

	async execute(interaction) {
		const channelAlias = JSON.parse(interaction.options.getString('channel_name'))[0];
		const channel = global.channels.getByAlias(channelAlias);

		if (!channel) {
			return interaction.reply({
				ephemeral: false,
				content: `No channel named ${channelAlias} found`
			});
		}

		const replyObject = {
			ephemeral: false,
			content: interaction.options.getString('content') ?? ''
		}

		const relativeFilePath = interaction.options.getString('file_path');

		if (relativeFilePath) {
			const filePath = path.join(global.downloadsFolder, relativeFilePath);

			if (!(await waitForFile(filePath))) {
				return interaction.reply({
					ephemeral: false,
					content: `No file found at ${filePath}`
				});
			}

			replyObject.files = [filePath];
		}

		await channel.send(replyObject);

		await interaction.reply({
			ephemeral: true,
			content: 'done'
		});
	}
};
