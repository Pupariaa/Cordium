'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "channelId", type: "string", mandatory: true, range: [17, 20] },
	],
	handler: async function (params) {
		try {
			if (!global.guild) {
				return { status_code: 503, error: 'Bot not connected to guild' };
			}

			const channel = global.guild.channels.cache.get(params.channelId);
			if (!channel) {
				return { status_code: 404, error: 'Channel not found' };
			}

			if (!channel.isTextBased()) {
				return { status_code: 400, error: 'Channel is not text-based' };
			}

			const pinnedMessages = await channel.messages.fetchPinned();

			const messages = pinnedMessages.map(msg => ({
				id: msg.id,
				content: msg.content,
				authorId: msg.author.id,
				authorUsername: msg.author.username,
				timestamp: msg.createdTimestamp,
				url: msg.url,
				attachments: msg.attachments.size,
				embeds: msg.embeds.length
			}));

			return {
				status_code: 200,
				messages: messages,
				count: messages.length
			};
		} catch (err) {
			console.reportError('Error in get_pinned_messages:', err);
			return { status_code: 500, error: err.message };
		}
	},
};

