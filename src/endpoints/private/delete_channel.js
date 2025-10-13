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

			const channelName = channel.name;
			await channel.delete();

			return {
				status_code: 200,
				deleted: {
					id: params.channelId,
					name: channelName
				}
			};
		} catch (err) {
			console.reportError('Error in delete_channel:', err);
			return { status_code: 500, error: err.message };
		}
	},
};


