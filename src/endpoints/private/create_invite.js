'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "channelId", type: "string", mandatory: true, range: [17, 20] },
		{ name: "maxAge", type: "int", mandatory: false, range: [0, 604800] }, // Max 7 days in seconds
		{ name: "maxUses", type: "int", mandatory: false, range: [0, 100] },
		{ name: "temporary", type: "boolean", mandatory: false },
		{ name: "unique", type: "boolean", mandatory: false },
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

			const invite = await channel.createInvite({
				maxAge: params.maxAge || 86400, // Default 24 hours
				maxUses: params.maxUses || 0, // Default unlimited
				temporary: params.temporary || false,
				unique: params.unique || false
			});

			return {
				status_code: 201,
				invite: {
					code: invite.code,
					url: invite.url,
					channelId: invite.channel.id,
					channelName: invite.channel.name,
					maxAge: invite.maxAge,
					maxUses: invite.maxUses,
					temporary: invite.temporary,
					createdAt: invite.createdTimestamp,
					expiresAt: invite.expiresTimestamp
				}
			};
		} catch (err) {
			console.reportError('Error in create_invite:', err);
			return { status_code: 500, error: err.message };
		}
	},
};

