'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
	],
	handler: async function (params) {
		try {
			if (!global.guild) {
				return { status_code: 503, error: 'Bot not connected to guild' };
			}

			const guild = global.guild;

			// Get channel types count
			const channelTypes = {};
			guild.channels.cache.forEach(channel => {
				const typeName = channel.type.toString();
				channelTypes[typeName] = (channelTypes[typeName] || 0) + 1;
			});

			// Get member stats
			const memberStats = {
				total: guild.memberCount,
				online: guild.members.cache.filter(m => m.presence?.status === 'online').size,
				idle: guild.members.cache.filter(m => m.presence?.status === 'idle').size,
				dnd: guild.members.cache.filter(m => m.presence?.status === 'dnd').size,
				offline: guild.members.cache.filter(m => !m.presence || m.presence?.status === 'offline').size,
				bots: guild.members.cache.filter(m => m.user.bot).size,
				humans: guild.members.cache.filter(m => !m.user.bot).size
			};

			return {
				status_code: 200,
				stats: {
					guild: {
						name: guild.name,
						id: guild.id,
						memberCount: guild.memberCount,
						createdAt: guild.createdTimestamp,
						ownerId: guild.ownerId
					},
					channels: {
						total: guild.channels.cache.size,
						types: channelTypes
					},
					roles: {
						total: guild.roles.cache.size
					},
					members: memberStats,
					emojis: {
						total: guild.emojis.cache.size
					},
					premium: {
						tier: guild.premiumTier,
						subscriptionCount: guild.premiumSubscriptionCount
					}
				}
			};
		} catch (err) {
			console.reportError('Error in get_server_stats:', err);
			return { status_code: 500, error: err.message };
		}
	},
};

