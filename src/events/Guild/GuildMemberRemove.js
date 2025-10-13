'use strict';

module.exports = {
	listen: true,
	report: true,
	callback: async function (member) {
		if (global.eventsDatabase && global.eventsDatabaseOnline) {
			try {
				await global.eventsDatabase.events.create({
					event_name: 'GuildMemberRemove',
					user_id: member.id,
					user_name: member.user.username,
					user_avatar: member.user.displayAvatarURL({ size: 128 }),
					guild_id: member.guild.id,
					event_data: JSON.stringify({
						joinedAt: member.joinedTimestamp,
						leftAt: Date.now(),
						roles: member.roles.cache.map(r => r.id)
					}),
					timestamp: Date.now()
				});
			} catch (err) {
				console.reportError('Error recording GuildMemberRemove:', err.message);
			}
		}
	}
}