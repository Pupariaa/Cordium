'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "channelId", type: "string", mandatory: true, range: [17, 20] },
		{ name: "name", type: "string", mandatory: false, range: [1, 100] },
		{ name: "topic", type: "string", mandatory: false, range: [0, 1024] },
		{ name: "nsfw", type: "boolean", mandatory: false },
		{ name: "rateLimitPerUser", type: "int", mandatory: false, range: [0, 21600] },
		{ name: "parentId", type: "string", mandatory: false, range: [17, 20] },
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

			const updates = {};
			if (params.name) updates.name = params.name;
			if (params.topic !== undefined) updates.topic = params.topic;
			if (params.nsfw !== undefined) updates.nsfw = params.nsfw;
			if (params.rateLimitPerUser !== undefined) updates.rateLimitPerUser = params.rateLimitPerUser;
			if (params.parentId !== undefined) updates.parent = params.parentId;

			await channel.edit(updates);

			return {
				status_code: 200,
				channel: {
					id: channel.id,
					name: channel.name,
					type: channel.type
				}
			};
		} catch (err) {
			console.reportError('Error in edit_channel:', err);
			return { status_code: 500, error: err.message };
		}
	},
};


