'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "channelId", type: "string", mandatory: false, range: [17, 20] },
		{ name: "limit", type: "int", mandatory: false, range: [1, 100] },
		{ name: "before", type: "string", mandatory: false, range: [17, 20] },
		{ name: "after", type: "string", mandatory: false, range: [17, 20] },
		{ name: "authorId", type: "string", mandatory: false, range: [17, 20] },
	],
	handler: async function (params) {
		try {
			// Try to get from cache first if Redis is available
			if (global.messagesCache && global.redisOnline && !params.channelId) {
				const result = await global.messagesCache.getMessages(params.limit || 30, params.before);

				// Filter by author if specified
				if (params.authorId) {
					result.messages = result.messages.filter(m => m.authorId === params.authorId);
				}

				return {
					status_code: 200,
					messages: result.messages,
					hasMore: result.hasMore,
					source: 'cache'
				};
			}

			// Otherwise fetch from Discord
			if (!global.guild) {
				return { status_code: 503, error: 'Bot not connected to guild' };
			}

			if (!params.channelId) {
				return { status_code: 400, error: 'channelId required when cache not available' };
			}

			const channel = global.guild.channels.cache.get(params.channelId);
			if (!channel) {
				return { status_code: 404, error: 'Channel not found' };
			}

			if (!channel.isTextBased()) {
				return { status_code: 400, error: 'Channel is not text-based' };
			}

			const fetchOptions = { limit: params.limit || 50 };
			if (params.before) fetchOptions.before = params.before;
			if (params.after) fetchOptions.after = params.after;

			const messages = await channel.messages.fetch(fetchOptions);

			let messagesList = messages.map(msg => ({
				id: msg.id,
				content: msg.content,
				authorId: msg.author.id,
				authorUsername: msg.author.username,
				authorAvatar: msg.author.displayAvatarURL({ size: 64 }),
				channelId: msg.channel.id,
				channelName: msg.channel.name,
				timestamp: msg.createdTimestamp,
				editedTimestamp: msg.editedTimestamp,
				pinned: msg.pinned,
				attachments: msg.attachments.map(a => ({
					name: a.name,
					url: a.url,
					contentType: a.contentType
				})),
				embeds: msg.embeds.length,
				reactions: msg.reactions.cache.map(r => ({
					emoji: r.emoji.name,
					emojiId: r.emoji.id,
					count: r.count
				}))
			}));

			// Filter by author if specified
			if (params.authorId) {
				messagesList = messagesList.filter(m => m.authorId === params.authorId);
			}

			return {
				status_code: 200,
				messages: messagesList,
				count: messagesList.length,
				source: 'discord'
			};
		} catch (err) {
			console.reportError('Error in get_messages:', err);
			return { status_code: 500, error: err.message };
		}
	},
};
