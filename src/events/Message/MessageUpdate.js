'use strict';

module.exports = {
	listen: true,
	report: true,
	callback: async function (oldMessage, newMessage) {
		if (global.messagesCache && oldMessage.content !== newMessage.content) {
			// Store edit history
			await global.messagesCache.addMessageEdit(
				newMessage.id,
				oldMessage.content || '',
				newMessage.content || '',
				newMessage.editedTimestamp || Date.now()
			);

			// Update the message in cache
			await global.messagesCache.updateMessage(newMessage);
		}
	}
}