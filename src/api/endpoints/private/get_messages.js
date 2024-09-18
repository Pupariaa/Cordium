'use strict';

const spectraget = require('spectraget')

module.exports = {

	/**
	 * @description Return messages between given timestamps, from specific channels, sent by specific users.
	 * @param {object} ep - The endpoint object
	 * @param {object} requestData - The request data object
	 * @param {string} requestData.key - The API key
	 * @param {number} requestData.startAt - The start timestamp
	 * @param {number} requestData.endAt - The end timestamp
	 * @param {number} [requestData.limit=100] - The maximum number of messages to return
	 * @param {string[]} [requestData.channelsId] - The IDs of the channels to get messages from
	 * @param {string[]} [requestData.usersIds] - The IDs of the users to get messages from
	 * @returns {Promise<object[]>} - The array of message objects
	 */
	handleRequest: async (ep, requestData) => {
		const validationError = spectraget.validate(ep.params, requestData);
		if (requestData.key !== "bAhRTVpaXS4FvEeD9k2KLOI6Ho92MReU" || !requestData.key) {
			return { error: 'Unauthorized', status_code: 401 }
		}
		if (validationError) {
			return validationError;
		}

		const messageData = await global.databaseCache.get_messages(requestData.startAt, requestData.endAt, requestData.limit, requestData.channelsIds, requestData.usersIds);
		return messageData
	},
};
