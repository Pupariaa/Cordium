'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "channelId", type: "string", mandatory: true, range: [17, 20] },
		{ name: "count", type: "int", mandatory: false, range: [2, 100] },
		{ name: "messageIds", type: "array", mandatory: false },
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

			let deletedCount = 0;

			if (params.messageIds && params.messageIds.length > 0) {
				// Delete specific messages
				const messages = await channel.messages.fetch({ limit: 100 });
				const toDelete = messages.filter(m => params.messageIds.includes(m.id));

				if (toDelete.size > 1) {
					await channel.bulkDelete(toDelete);
					deletedCount = toDelete.size;
				} else if (toDelete.size === 1) {
					await toDelete.first().delete();
					deletedCount = 1;
				}
			} else {
				// Delete last N messages
				const count = params.count || 10;
				const deleted = await channel.bulkDelete(count, true);
				deletedCount = deleted.size;
			}

			return {
				status_code: 200,
				deleted: deletedCount,
				channelId: params.channelId
			};
		} catch (err) {
			console.reportError('Error in bulk_delete_messages:', err);
			return { status_code: 500, error: err.message };
		}
	},
};

