'use strict';

module.exports = {
	listen: true,
	report: true,
	callback: async function (reaction, user, details) {
		if (global.messagesCache) {
			// Store reaction event
			await global.messagesCache.addReactionEvent(
				reaction.message.id,
				user.id,
				user.username,
				reaction.emoji.name,
				reaction.emoji.id,
				'add',
				Date.now()
			);

			// Update message reactions in cache
			await global.messagesCache.updateMessage(reaction.message);
		}
	}
}