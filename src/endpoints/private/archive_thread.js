'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "threadId", type: "string", mandatory: true, range: [17, 20] },
		{ name: "archive", type: "boolean", mandatory: false },
		{ name: "locked", type: "boolean", mandatory: false },
	],
	handler: async function (params) {
		try {
			if (!global.guild) {
				return { status_code: 503, error: 'Bot not connected to guild' };
			}

			const thread = global.guild.channels.cache.get(params.threadId);
			if (!thread || !thread.isThread()) {
				return { status_code: 404, error: 'Thread not found' };
			}

			const updates = {};
			if (params.archive !== undefined) updates.archived = params.archive;
			if (params.locked !== undefined) updates.locked = params.locked;

			await thread.edit(updates);

			return {
				status_code: 200,
				thread: {
					id: thread.id,
					name: thread.name,
					archived: thread.archived,
					locked: thread.locked
				}
			};
		} catch (err) {
			console.reportError('Error in archive_thread:', err);
			return { status_code: 500, error: err.message };
		}
	},
};


