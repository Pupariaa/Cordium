'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "webhookId", type: "string", mandatory: true, range: [17, 20] },
	],
	handler: async function (params) {
		try {
			if (!global.guild) {
				return { status_code: 503, error: 'Bot not connected to guild' };
			}

			const webhooks = await global.guild.fetchWebhooks();
			const webhook = webhooks.get(params.webhookId);

			if (!webhook) {
				return { status_code: 404, error: 'Webhook not found' };
			}

			const webhookName = webhook.name;
			await webhook.delete();

			return {
				status_code: 200,
				deleted: {
					id: params.webhookId,
					name: webhookName
				}
			};
		} catch (err) {
			console.reportError('Error in delete_webhook:', err);
			return { status_code: 500, error: err.message };
		}
	},
};


