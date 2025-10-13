'use strict';

module.exports = {
	listen: true,
	report: true,
	callback: async function (messages, channel) {
		if (global.eventsDatabase && global.eventsDatabaseOnline) {
			try {
				await global.eventsDatabase.events.create({
					event_name: 'MessageBulkDelete',
					guild_id: channel.guild?.id,
					channel_id: channel.id,
					event_data: JSON.stringify({
						count: messages.size,
						channelName: channel.name,
						messageIds: Array.from(messages.keys())
					}),
					timestamp: Date.now()
				});
			} catch (err) {
				console.reportError('Error recording MessageBulkDelete:', err.message);
			}
		}
	}
}