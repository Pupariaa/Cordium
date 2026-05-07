'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "emojiId", type: "string", mandatory: true, range: [17, 20] },
	],
	handler: async function (params) {
		try {
			if (!global.guild) {
				return { status_code: 503, error: 'Bot not connected to guild' };
			}

			const emoji = global.guild.emojis.cache.get(params.emojiId);
			if (!emoji) {
				return { status_code: 404, error: 'Emoji not found' };
			}

			if (emoji.managed) {
				return { status_code: 403, error: 'Cannot delete a managed emoji' };
			}

			const emojiName = emoji.name;
			await emoji.delete();

			return {
				status_code: 200,
				deleted: {
					id: params.emojiId,
					name: emojiName
				}
			};
		} catch (err) {
			console.reportError('Error in delete_emoji:', err);
			return { status_code: 500, error: err.message };
		}
	},
};







