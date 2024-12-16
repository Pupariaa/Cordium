'use strict';

const { waitForFile } = require(global.utilsPath);

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "channelAlias", type: "string", mandatory: true },
		{ name: "imgPaths", type: "string", mandatory: true },
		{ name: "message", type: "string", mandatory: true },
	],
	handler: async function (params) {
		try {
			const imgPaths = params.imgPaths.split(',');

			for (const imgPath of imgPaths) {
				if (!(await waitForFile(imgPath))) {
					return { status_code: 404, error: `File does not exist: ${imgPath}` };
				}
			}

			const channel = await global.channels.getByAlias(params.channelAlias);

			await channel.send({
				content: params.message,
				files: [imgPaths[0]],
			});

			for (let i = 1; i < imgPaths.length; i++) {
				await new Promise(resolve => setTimeout(resolve, 50));
				await channel.send({
					files: [imgPaths[i]],
				});
			}

			return { status_code: 200 };
		} catch (err) {
			console.reportError(err);
			return { status_code: 500, error: err.message };
		}
	},
};
