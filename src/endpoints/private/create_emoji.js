'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "name", type: "string", mandatory: true, range: [2, 32] },
		{ name: "imageUrl", type: "string", mandatory: true },
	],
	handler: async function (params) {
		try {
			if (!global.guild) {
				return { status_code: 503, error: 'Bot not connected to guild' };
			}

			const emoji = await global.guild.emojis.create({
				attachment: params.imageUrl,
				name: params.name
			});

			return {
				status_code: 201,
				emoji: {
					id: emoji.id,
					name: emoji.name,
					url: emoji.url,
					animated: emoji.animated
				}
			};
		} catch (err) {
			console.reportError('Error in create_emoji:', err);
			return { status_code: 500, error: err.message };
		}
	},
};







