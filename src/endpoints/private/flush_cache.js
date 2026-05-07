'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "confirm", type: "boolean", mandatory: true },
	],
	handler: async function (params) {
		try {
			if (!params.confirm) {
				return { status_code: 400, error: 'Confirmation required to flush cache' };
			}

			if (!global.cache) {
				return { status_code: 503, error: 'Cache not initialized' };
			}

			await global.cache.flush();

			return {
				status_code: 200,
				flushed: true,
				message: 'Cache flushed successfully'
			};
		} catch (err) {
			console.reportError('Error in flush_cache:', err);
			return { status_code: 500, error: err.message };
		}
	},
};







