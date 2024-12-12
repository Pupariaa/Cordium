'use strict';

const spectraget = require('spectraget');
const { waitForFile } = require(global.utilsPath);

module.exports = {
	/**
	 * @description Sends the image at the given path in the requested channel
	 * @param {object} ep - The endpoint object
	 * @param {object} requestData - The request data object
	 * @param {string} requestData.channelAlias - The channel alias as defined in config/channels.json
	 * @param {string} requestData.imgPath - The absolute path to the image to send to the channel of alias {channelAlias}
	 * @param {string} requestData.message - The message string to send along with the image
	 * @returns {Promise<object>} - If the request succeeded
	 */
	handleRequest: async (ep, requestData) => {
		const validationError = spectraget.validate(ep.params, requestData);
		if (validationError) {
			return validationError;
		}

		try {
			if (!(await waitForFile(requestData.imgPath))) {
				return { status_code: 404, error: 'file does not exists' };
			}

			await global.channels.getByAlias(requestData.channelAlias).send({
				content: requestData.message,
				files: [requestData.imgPath],
			});

			return { status_code: 200 };
		} catch (err) {
			console.reportError(err);
			return { status_code: 500, error: error.message };
		}
	},
};