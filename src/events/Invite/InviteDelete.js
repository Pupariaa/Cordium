'use strict';

module.exports = {
	listen: true,
	report: true,
	callback: async function (invite) {
		if (global.eventsDatabase && global.eventsDatabaseOnline) {
			try {
				await global.eventsDatabase.events.create({
					event_name: 'InviteDelete',
					guild_id: invite.guild?.id,
					channel_id: invite.channel?.id,
					event_data: JSON.stringify({
						code: invite.code,
						channelName: invite.channel?.name
					}),
					timestamp: Date.now()
				});
			} catch (err) {
				console.reportError('Error recording InviteDelete:', err.message);
			}
		}
	}
}