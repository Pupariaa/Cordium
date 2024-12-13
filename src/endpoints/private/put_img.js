'use strict';

const { waitForFile } = require(global.utilsPath);

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "channelAlias", type: "string", mandatory: true },
		{ name: "imgPath", type: "string", mandatory: true },
		{ name: "message", type: "string", mandatory: true },
	],
	handler: async function (params) {
		try {
			if (!(await waitForFile(params.imgPath))) {
				return { status_code: 404, error: 'file does not exists' };
			}

			await global.channels.getByAlias(params.channelAlias).send({
				content: params.message,
				files: [params.imgPath],
			});

			return { status_code: 200 };
		} catch (err) {
			console.reportError(err);
			return { status_code: 500, error: error.message };
		}
	},
};