'use strict';

module.exports = {
	listen: true,
	report: true,
	callback: async function (message) {
		if (global.messagesCache) {
			await global.messagesCache.deleteMessage(message.id);
		}

		if (global.eventsDatabase && global.eventsDatabaseOnline) {
			try {
				await global.eventsDatabase.events.create({
					event_name: 'MessageDelete',
					user_id: message.author?.id,
					user_name: message.author?.username,
					user_avatar: message.author?.displayAvatarURL({ size: 128 }),
					guild_id: message.guild?.id,
					channel_id: message.channel.id,
					message_id: message.id,
					event_data: JSON.stringify({
						content: message.content?.substring(0, 500) || '[Unknown content]'
					}),
					timestamp: Date.now()
				});
			} catch (err) {
				console.reportError('Error recording MessageDelete:', err.message);
			}
		}
	}
}