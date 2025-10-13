'use strict';

module.exports = {
	listen: true,
	report: true,
	callback: async function (role) {
		if (global.eventsDatabase && global.eventsDatabaseOnline) {
			try {
				await global.eventsDatabase.events.create({
					event_name: 'GuildRoleCreate',
					guild_id: role.guild.id,
					event_data: JSON.stringify({
						roleId: role.id,
						name: role.name,
						color: role.hexColor,
						permissions: role.permissions.toArray()
					}),
					timestamp: Date.now()
				});
			} catch (err) {
				console.reportError('Error recording GuildRoleCreate:', err.message);
			}
		}
	}
}