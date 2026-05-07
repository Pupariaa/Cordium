'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "channelId", type: "string", mandatory: true, range: [17, 20] },
		{ name: "name", type: "string", mandatory: true, range: [1, 80] },
		{ name: "avatarUrl", type: "string", mandatory: false },
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

			if (!channel.isTextBased()) {
				return { status_code: 400, error: 'Channel is not text-based' };
			}

			const webhookOptions = { name: params.name };
			if (params.avatarUrl) {
				webhookOptions.avatar = params.avatarUrl;
			}

			const webhook = await channel.createWebhook(webhookOptions);

			return {
				status_code: 201,
				webhook: {
					id: webhook.id,
					name: webhook.name,
					url: webhook.url,
					token: webhook.token,
					channelId: webhook.channelId
				}
			};
		} catch (err) {
			console.reportError('Error in create_webhook:', err);
			return { status_code: 500, error: err.message };
		}
	},
};







