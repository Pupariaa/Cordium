'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "channelId", type: "string", mandatory: false, range: [17, 20] },
		{ name: "messageId", type: "string", mandatory: false, range: [17, 20] },
		{ name: "name", type: "string", mandatory: true, range: [1, 100] },
		{ name: "autoArchiveDuration", type: "int", mandatory: false },
	],
	handler: async function (params) {
		try {
			if (!global.guild) {
				return { status_code: 503, error: 'Bot not connected to guild' };
			}

			let thread;

			if (params.messageId && params.channelId) {
				// Create thread from message
				const channel = global.guild.channels.cache.get(params.channelId);
				if (!channel) {
					return { status_code: 404, error: 'Channel not found' };
				}

				const message = await channel.messages.fetch(params.messageId);
				if (!message) {
					return { status_code: 404, error: 'Message not found' };
				}

				thread = await message.startThread({
					name: params.name,
					autoArchiveDuration: params.autoArchiveDuration || 60
				});
			} else if (params.channelId) {
				// Create standalone thread
				const channel = global.guild.channels.cache.get(params.channelId);
				if (!channel) {
					return { status_code: 404, error: 'Channel not found' };
				}

				thread = await channel.threads.create({
					name: params.name,
					autoArchiveDuration: params.autoArchiveDuration || 60
				});
			} else {
				return { status_code: 400, error: 'channelId required' };
			}

			return {
				status_code: 201,
				thread: {
					id: thread.id,
					name: thread.name,
					parentId: thread.parentId,
					ownerId: thread.ownerId,
					archived: thread.archived
				}
			};
		} catch (err) {
			console.reportError('Error in create_thread:', err);
			return { status_code: 500, error: err.message };
		}
	},
};

