'use strict';

const spectraget = require('spectraget');

module.exports = {
	/**
	 * @description Sends the image at the given path in the requested channel
	 * @param {object} ep - The endpoint object
	 * @param {object} requestData - The request data object
	 * @returns {Promise<object[]>} - If the request succeeded
	 */
	handleRequest: async (ep, requestData) => {
		// if (requestData.key !== "bAhRTVpaXS4FvEeD9k2KLOI6Ho92MReU" || !requestData.key) {
		// 	return { error: 'Unauthorized', status_code: 401 }
		// }
		const validationError = spectraget.validate(ep.params, requestData);
		if (validationError) {
			return validationError;
		}

		try {
			console.report('test endpoint received');
			return { status_code: 200 };
		} catch {
			return { status_code: 400 };
		}
	},
};

