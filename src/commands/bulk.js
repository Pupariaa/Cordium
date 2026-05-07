'use strict';

const { SlashCommandBuilder } = require('discord.js');
const path = require('path');

const cmdName = path.basename(__filename, path.extname(__filename));
const cmdDescription = 'deletes all messages in the current channel';

module.exports = {
	data: new SlashCommandBuilder()
		.setName(cmdName)
		.setDescription(cmdDescription),

	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		const channel = interaction.channel;

		if (!channel.isTextBased() || channel.isThread()) {
			return interaction.editReply({
				content: 'This command can only be used in text channels',
			});
		}

		try {
			await interaction.editReply({
				content: 'Deleting channel and recreating...',
			});

			const channelData = {
				name: channel.name,
				type: channel.type,
			};

			if (channel.parent) {
				channelData.parent = channel.parent.id;
			}
			if (channel.topic) {
				channelData.topic = channel.topic;
			}
			if (channel.nsfw !== undefined) {
				channelData.nsfw = channel.nsfw;
			}
			if (channel.rateLimitPerUser !== undefined) {
				channelData.rateLimitPerUser = channel.rateLimitPerUser;
			}

			const permissionOverwrites = channel.permissionOverwrites.cache.map(overwrite => ({
				id: overwrite.id,
				type: overwrite.type,
				allow: overwrite.allow.bitfield,
				deny: overwrite.deny.bitfield,
			}));
			if (permissionOverwrites.length > 0) {
				channelData.permissionOverwrites = permissionOverwrites;
			}

			const position = channel.position;

			await channel.delete();

			const newChannel = await channel.guild.channels.create(channelData);

			if (position !== undefined) {
				await newChannel.setPosition(position);
			}

			await interaction.editReply({
				content: 'done',
			});
		} catch (err) {
			console.reportError('Error in bulk command:', err);
			await interaction.editReply({
				content: `Error: ${err.message}`,
			});
		}
	}
};

