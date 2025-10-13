'use strict';

module.exports = {
	listen: true,
	report: true,
	callback: async function (channel) {
		if (global.eventsDatabase && global.eventsDatabaseOnline) {
			try {
				await global.eventsDatabase.events.create({
					event_name: 'ChannelDelete',
					guild_id: channel.guild?.id,
					channel_id: channel.id,
					event_data: JSON.stringify({
						name: channel.name,
						type: channel.type
					}),
					timestamp: Date.now()
				});
			} catch (err) {
				console.reportError('Error recording ChannelDelete:', err.message);
			}
		}
	}
}