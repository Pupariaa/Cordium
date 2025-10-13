'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "query", type: "string", mandatory: true, range: [1, 200] },
		{ name: "channelId", type: "string", mandatory: false, range: [17, 20] },
		{ name: "authorId", type: "string", mandatory: false, range: [17, 20] },
		{ name: "limit", type: "int", mandatory: false, range: [1, 100] },
	],
	handler: async function (params) {
		try {
			if (!global.messagesCache || !global.redisOnline) {
				return { status_code: 503, error: 'Message cache not available. Redis required for search.' };
			}

			// Get all messages from cache
			const allMessages = await global.redisManager.client.zRange('messages:list', 0, -1);

			const query = params.query.toLowerCase();
			const limit = params.limit || 50;
			let matches = [];

			for (const msgStr of allMessages) {
				const msg = JSON.parse(msgStr);

				// Filter by channel if specified
				if (params.channelId && msg.channelId !== params.channelId) {
					continue;
				}

				// Filter by author if specified
				if (params.authorId && msg.authorId !== params.authorId) {
					continue;
				}

				// Search in content, username, channel name
				const searchText = `${msg.content} ${msg.authorUsername} ${msg.channelName}`.toLowerCase();

				if (searchText.includes(query)) {
					matches.push(msg);

					if (matches.length >= limit) {
						break;
					}
				}
			}

			return {
				status_code: 200,
				messages: matches,
				count: matches.length,
				query: params.query
			};
		} catch (err) {
			console.reportError('Error in search_messages:', err);
			return { status_code: 500, error: err.message };
		}
	},
};

