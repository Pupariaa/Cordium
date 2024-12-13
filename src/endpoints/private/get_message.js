'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "id", type: "int", mandatory: true, range: [18, 19] },
	],
	handler: async function (params) {
		// const messageData = await global.databaseCache.get_message(params.id);
		// return messageData;
	},
};

