'use strict';

module.exports = {
	listen: true,
	report: true,
	callback: async function (oldRole, newRole) {
		if (global.eventsDatabase && global.eventsDatabaseOnline) {
			try {
				const changes = {};
				
				if (oldRole.name !== newRole.name) {
					changes.name = { old: oldRole.name, new: newRole.name };
				}
				
				if (oldRole.color !== newRole.color) {
					changes.color = { old: oldRole.hexColor, new: newRole.hexColor };
				}
				
				if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
					changes.permissions = 'modified';
				}
				
				if (Object.keys(changes).length > 0) {
					await global.eventsDatabase.events.create({
						event_name: 'GuildRoleUpdate',
						guild_id: newRole.guild.id,
						event_data: JSON.stringify({
							roleId: newRole.id,
							roleName: newRole.name,
							changes: changes
						}),
						timestamp: Date.now()
					});
				}
			} catch (err) {
				console.reportError('Error recording GuildRoleUpdate:', err.message);
			}
		}
	}
}