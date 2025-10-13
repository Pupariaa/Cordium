'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "channelId", type: "string", mandatory: false, range: [17, 20] },
		{ name: "type", type: "int", mandatory: false, range: [0, 15] },
	],
	handler: async function (params) {
		try {
			if (!global.guild) {
				return { status_code: 503, error: 'Bot not connected to guild' };
			}

			// Get specific channel
			if (params.channelId) {
				const channel = global.guild.channels.cache.get(params.channelId);
				if (!channel) {
					return { status_code: 404, error: 'Channel not found' };
				}

				return {
					status_code: 200,
					channel: {
						id: channel.id,
						name: channel.name,
						type: channel.type,
						parentId: channel.parentId,
						position: channel.position,
						topic: channel.topic || null,
						nsfw: channel.nsfw || false,
						rateLimitPerUser: channel.rateLimitPerUser || 0,
						members: channel.members ? channel.members.size : null,
						createdAt: channel.createdTimestamp
					}
				};
			}

			// Get all channels
			const channels = [];
			global.guild.channels.cache.forEach(channel => {
				// Filter by type if specified
				if (params.type !== undefined && channel.type !== params.type) {
					return;
				}

				channels.push({
					id: channel.id,
					name: channel.name,
					type: channel.type,
					parentId: channel.parentId,
					position: channel.position,
					topic: channel.topic || null,
					nsfw: channel.nsfw || false,
					members: channel.members ? channel.members.size : null
				});
			});

			channels.sort((a, b) => a.position - b.position);

			return {
				status_code: 200,
				channels: channels,
				count: channels.length
			};
		} catch (err) {
			console.reportError('Error in get_channels:', err);
			return { status_code: 500, error: err.message };
		}
	},
};


