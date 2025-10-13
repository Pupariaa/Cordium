'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
	],
	handler: async function (params) {
		try {
			const stats = {
				redis: {
					online: global.redisOnline || false,
					host: process.env.redis_host || null,
					port: process.env.redis_port || null,
					db: process.env.redis_db || null
				},
				cache: global.cache ? global.cache.getStats() : null,
				messages: null
			};

			if (global.messagesCache) {
				const messageStats = await global.messagesCache.getStats();
				stats.messages = messageStats;
			}

			return {
				status_code: 200,
				stats: stats
			};
		} catch (err) {
			console.reportError('Error in get_cache_stats:', err);
			return { status_code: 500, error: err.message };
		}
	},
};

