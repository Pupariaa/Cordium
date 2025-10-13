'use strict';

module.exports = {
	listen: true,
	report: true,
	callback: async function (oldChannel, newChannel) {
		if (global.eventsDatabase && global.eventsDatabaseOnline) {
			try {
				const changes = {};
				
				if (oldChannel.name !== newChannel.name) {
					changes.name = { old: oldChannel.name, new: newChannel.name };
				}
				
				if (oldChannel.topic !== newChannel.topic) {
					changes.topic = { old: oldChannel.topic, new: newChannel.topic };
				}
				
				if (Object.keys(changes).length > 0) {
					await global.eventsDatabase.events.create({
						event_name: 'ChannelUpdate',
						guild_id: newChannel.guild?.id,
						channel_id: newChannel.id,
						event_data: JSON.stringify({
							channelName: newChannel.name,
							changes: changes
						}),
						timestamp: Date.now()
					});
				}
			} catch (err) {
				console.reportError('Error recording ChannelUpdate:', err.message);
			}
		}
	}
}