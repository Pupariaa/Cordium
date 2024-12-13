'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "startAt", type: "int", mandatory: false },
		{ name: "endAt", type: "int", mandatory: false },
		{ name: "limit", type: "int", mandatory: false, range: [1, 100000] },
		{ name: "channelsIds", type: "string", mandatory: false },
		{ name: "usersIds", type: "string", mandatory: false },
	],
	handler: async function (params) {
		const messageData = await global.databaseCache.get_messages(params.startAt, params.endAt, params.limit, params.channelsIds, params.usersIds);
		return messageData;
	},
};
