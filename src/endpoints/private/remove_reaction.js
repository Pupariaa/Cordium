'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "channelId", type: "string", mandatory: true, range: [17, 20] },
		{ name: "messageId", type: "string", mandatory: true, range: [17, 20] },
		{ name: "emoji", type: "string", mandatory: true, range: [1, 100] },
		{ name: "userId", type: "string", mandatory: false, range: [17, 20] },
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

			const reaction = message.reactions.cache.find(r => r.emoji.name === params.emoji || r.emoji.id === params.emoji);

			if (!reaction) {
				return { status_code: 404, error: 'Reaction not found on message' };
			}

			if (params.userId) {
				// Remove specific user's reaction
				const user = await global.client.users.fetch(params.userId);
				await reaction.users.remove(user);
			} else {
				// Remove all reactions of this emoji
				await reaction.remove();
			}

			return {
				status_code: 200,
				reaction: {
					messageId: params.messageId,
					emoji: params.emoji,
					removed: true
				}
			};
		} catch (err) {
			console.reportError('Error in remove_reaction:', err);
			return { status_code: 500, error: err.message };
		}
	},
};







