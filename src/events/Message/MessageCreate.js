'use strict';

module.exports = {
	listen: true,
	report: true,
	callback: async function (message) {
		if (global.saveAttachments && message.attachments.size > 0) {
			await global.attachmentsManager.saveAttachments(message);
		}

		if (global.messagesCache) {
			await global.messagesCache.addMessage(message);
		}
	}
}