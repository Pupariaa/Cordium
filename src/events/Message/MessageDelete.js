'use strict';

module.exports = {
	listen: true,
	report: true,
	callback: async function (message) {
		if (global.messagesCache) {
			await global.messagesCache.deleteMessage(message.id);
		}
	}
}