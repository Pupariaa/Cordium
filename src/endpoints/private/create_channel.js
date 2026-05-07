'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "name", type: "string", mandatory: true, range: [1, 100] },
		{ name: "type", type: "int", mandatory: false, range: [0, 15] },
		{ name: "parentId", type: "string", mandatory: false, range: [17, 20] },
		{ name: "topic", type: "string", mandatory: false, range: [0, 1024] },
		{ name: "nsfw", type: "boolean", mandatory: false },
		{ name: "rateLimitPerUser", type: "int", mandatory: false, range: [0, 21600] },
	],
	handler: async function (params) {
		try {
			if (!global.guild) {
				return { status_code: 503, error: 'Bot not connected to guild' };
			}

			const channelData = {
				name: params.name,
				type: params.type || 0
			};

			if (params.parentId) channelData.parent = params.parentId;
			if (params.topic) channelData.topic = params.topic;
			if (params.nsfw !== undefined) channelData.nsfw = params.nsfw;
			if (params.rateLimitPerUser !== undefined) channelData.rateLimitPerUser = params.rateLimitPerUser;

			const channel = await global.guild.channels.create(channelData);

			return {
				status_code: 201,
				channel: {
					id: channel.id,
					name: channel.name,
					type: channel.type,
					parentId: channel.parentId
				}
			};
		} catch (err) {
			console.reportError('Error in create_channel:', err);
			return { status_code: 500, error: err.message };
		}
	},
};







