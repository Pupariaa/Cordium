'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "userid", type: "int", mandatory: true, range: [17, 18] },
	],
	handler: async function (params) {
		// const pairs = await global.databaseCache.get_voice_member(params.userid);
		// return pairs;
	},
};
