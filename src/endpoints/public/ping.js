'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
	],
	handler: async function (params) {
		try {
			return { status_code: 200, ping: 'pong' };
		} catch {
			return { status_code: 400 };
		}
	},
};

