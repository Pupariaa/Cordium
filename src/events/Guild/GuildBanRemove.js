'use strict';

module.exports = {
	listen: true,
	report: true,
	callback: async function (ban) {
		if (global.eventsDatabase && global.eventsDatabaseOnline) {
			try {
				await global.eventsDatabase.events.create({
					event_name: 'GuildBanRemove',
					user_id: ban.user.id,
					user_name: ban.user.username,
					user_avatar: ban.user.displayAvatarURL({ size: 128 }),
					guild_id: ban.guild.id,
					event_data: JSON.stringify({
						unbanned: true
					}),
					timestamp: Date.now()
				});
			} catch (err) {
				console.reportError('Error recording GuildBanRemove:', err.message);
			}
		}
	}
}