'use strict';

const spectraget = require('spectraget');
const { waitForFile } = require(global.utilsPath);

module.exports = {
	handler: async function (params) {
		const validationError = spectraget.validate(this.endpoint.params, params);
		if (validationError) {
			return validationError;
		}

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