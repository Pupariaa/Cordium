'use strict';

const spectraget = require('spectraget');

module.exports = {
	/**
	 * @description Sends the image at the given path in the requested channel
	 * @param {object} ep - The endpoint object
	 * @param {object} requestData - The request data object
	 * @param {string} requestData.channelAlias - The channel alias as defined in config/channels.json
	 * @param {string} requestData.imgPath - The absolute path to the image to send to the channel of alias {channelAlias}
	 * @param {string} requestData.message - The message string to send along with the image
	 * @returns {Promise<bool>} - If the request succeeded
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
			await global.channels.getByAlias(requestData.channelAlias).send({
				content: requestData.message,
				files: [requestData.imgPath]
			});
			return true;
		} catch {
			return false;
		}
	},
};

