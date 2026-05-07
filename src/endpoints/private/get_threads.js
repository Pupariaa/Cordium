'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "channelId", type: "string", mandatory: false, range: [17, 20] },
		{ name: "archived", type: "boolean", mandatory: false },
	],
	handler: async function (params) {
		try {
			if (!global.guild) {
				return { status_code: 503, error: 'Bot not connected to guild' };
			}

			let threads = [];

			if (params.channelId) {
				const channel = global.guild.channels.cache.get(params.channelId);
				if (!channel) {
					return { status_code: 404, error: 'Channel not found' };
				}

				const activeThreads = await channel.threads.fetchActive();
				activeThreads.threads.forEach(thread => {
					threads.push({
						id: thread.id,
						name: thread.name,
						parentId: thread.parentId,
						ownerId: thread.ownerId,
						archived: thread.archived,
						locked: thread.locked,
						memberCount: thread.memberCount,
						messageCount: thread.messageCount,
						createdAt: thread.createdTimestamp
					});
				});

				if (params.archived) {
					const archivedThreads = await channel.threads.fetchArchived();
					archivedThreads.threads.forEach(thread => {
						threads.push({
							id: thread.id,
							name: thread.name,
							parentId: thread.parentId,
							ownerId: thread.ownerId,
							archived: thread.archived,
							locked: thread.locked,
							memberCount: thread.memberCount,
							messageCount: thread.messageCount,
							createdAt: thread.createdTimestamp
						});
					});
				}
			} else {
				// Get all active threads in guild
				const activeThreads = await global.guild.channels.fetchActiveThreads();
				activeThreads.threads.forEach(thread => {
					threads.push({
						id: thread.id,
						name: thread.name,
						parentId: thread.parentId,
						ownerId: thread.ownerId,
						archived: thread.archived,
						locked: thread.locked,
						memberCount: thread.memberCount,
						messageCount: thread.messageCount,
						createdAt: thread.createdTimestamp
					});
				});
			}

			return {
				status_code: 200,
				threads: threads,
				count: threads.length
			};
		} catch (err) {
			console.reportError('Error in get_threads:', err);
			return { status_code: 500, error: err.message };
		}
	},
};







