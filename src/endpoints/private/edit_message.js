'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "channelId", type: "string", mandatory: true, range: [17, 20] },
		{ name: "messageId", type: "string", mandatory: true, range: [17, 20] },
		{ name: "content", type: "string", mandatory: true, range: [1, 2000] },
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

			const message = await channel.messages.fetch(params.messageId);
			if (!message) {
				return { status_code: 404, error: 'Message not found' };
			}

			await message.edit(params.content);

			return {
				status_code: 200,
				message: {
					id: message.id,
					channelId: message.channel.id,
					content: message.content,
					edited: true,
					editedAt: message.editedTimestamp
				}
			};
		} catch (err) {
			console.reportError('Error in edit_message:', err);
			return { status_code: 500, error: err.message };
		}
	},
};

