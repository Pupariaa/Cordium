'use strict';

module.exports = {
	listen: true,
	report: true,
	callback: async function (oldMessage, newMessage) {
		if (global.messagesCache && oldMessage.content !== newMessage.content) {
			await global.messagesCache.addMessageEdit(
				newMessage.id,
				oldMessage.content || '',
				newMessage.content || '',
				newMessage.editedTimestamp || Date.now()
			);

			await global.messagesCache.updateMessage(newMessage);
		}

		if (global.eventsDatabase && global.eventsDatabaseOnline && oldMessage.content !== newMessage.content) {
			try {
				await global.eventsDatabase.events.create({
					event_name: 'MessageUpdate',
					user_id: newMessage.author.id,
					user_name: newMessage.author.username,
					user_avatar: newMessage.author.displayAvatarURL({ size: 128 }),
					guild_id: newMessage.guild?.id,
					channel_id: newMessage.channel.id,
					message_id: newMessage.id,
					event_data: JSON.stringify({
						oldContent: oldMessage.content.substring(0, 500),
						newContent: newMessage.content.substring(0, 500)
					}),
					timestamp: newMessage.editedTimestamp || Date.now()
				});
			} catch (err) {
				console.reportError('Error recording MessageUpdate:', err.message);
			}
		}
	}
}