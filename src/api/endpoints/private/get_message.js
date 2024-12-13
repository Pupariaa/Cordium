'use strict';

const spectraget = require('spectraget');

module.exports = {
	handler: async function (params) {
		if (params.key !== "bAhRTVpaXS4FvEeD9k2KLOI6Ho92MReU" || !params.key) {
			return { error: 'Unauthorized', status_code: 401 }
		}
		const validationError = spectraget.validate(this.endpoint.params, params);
		if (validationError) {
			return validationError;
		}

		// const messageData = await global.databaseCache.get_message(params.id);
		// return messageData;
	},
};

