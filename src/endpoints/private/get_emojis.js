'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "emojiId", type: "string", mandatory: false, range: [17, 20] },
	],
	handler: async function (params) {
		try {
			if (!global.guild) {
				return { status_code: 503, error: 'Bot not connected to guild' };
			}

			// Get specific emoji
			if (params.emojiId) {
				const emoji = global.guild.emojis.cache.get(params.emojiId);
				if (!emoji) {
					return { status_code: 404, error: 'Emoji not found' };
				}

				return {
					status_code: 200,
					emoji: {
						id: emoji.id,
						name: emoji.name,
						url: emoji.url,
						animated: emoji.animated,
						managed: emoji.managed,
						available: emoji.available,
						createdAt: emoji.createdTimestamp
					}
				};
			}

			// Get all emojis
			const emojis = global.guild.emojis.cache.map(emoji => ({
				id: emoji.id,
				name: emoji.name,
				url: emoji.url,
				animated: emoji.animated,
				managed: emoji.managed,
				available: emoji.available
			}));

			return {
				status_code: 200,
				emojis: emojis,
				count: emojis.length
			};
		} catch (err) {
			console.reportError('Error in get_emojis:', err);
			return { status_code: 500, error: err.message };
		}
	},
};


