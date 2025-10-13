'use strict';

module.exports = {
	listen: true,
	report: true,
	callback: async function (reaction, user, details) {
		if (global.messagesCache) {
			await global.messagesCache.addReactionEvent(
				reaction.message.id,
				user.id,
				user.username,
				reaction.emoji.name,
				reaction.emoji.id,
				'add',
				Date.now()
			);

			await global.messagesCache.updateMessage(reaction.message);
		}

		if (global.eventsDatabase && global.eventsDatabaseOnline) {
			try {
				await global.eventsDatabase.events.create({
					event_name: 'MessageReactionAdd',
					user_id: user.id,
					user_name: user.username,
					user_avatar: user.displayAvatarURL({ size: 128 }),
					guild_id: reaction.message.guild?.id,
					channel_id: reaction.message.channel.id,
					message_id: reaction.message.id,
					event_data: JSON.stringify({
						emoji: reaction.emoji.name,
						emojiId: reaction.emoji.id
					}),
					timestamp: Date.now()
				});
			} catch (err) {
				console.reportError('Error recording MessageReactionAdd:', err.message);
			}
		}
	}
}