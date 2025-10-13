'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "channelId", type: "string", mandatory: false, range: [17, 20] },
	],
	handler: async function (params) {
		try {
			if (!global.guild) {
				return { status_code: 503, error: 'Bot not connected to guild' };
			}

			let webhooks;

			if (params.channelId) {
				const channel = global.guild.channels.cache.get(params.channelId);
				if (!channel) {
					return { status_code: 404, error: 'Channel not found' };
				}
				webhooks = await channel.fetchWebhooks();
			} else {
				webhooks = await global.guild.fetchWebhooks();
			}

			const webhooksList = webhooks.map(webhook => ({
				id: webhook.id,
				name: webhook.name,
				channelId: webhook.channelId,
				token: webhook.token,
				url: webhook.url,
				avatarURL: webhook.avatarURL(),
				owner: webhook.owner ? {
					id: webhook.owner.id,
					username: webhook.owner.username
				} : null,
				createdAt: webhook.createdTimestamp
			}));

			return {
				status_code: 200,
				webhooks: webhooksList,
				count: webhooksList.length
			};
		} catch (err) {
			console.reportError('Error in get_webhooks:', err);
			return { status_code: 500, error: err.message };
		}
	},
};


