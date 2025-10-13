'use strict';

module.exports = {
	listen: true,
	report: true,
	callback: async function (oldMember, newMember) {
		if (global.eventsDatabase && global.eventsDatabaseOnline) {
			try {
				const changes = {};
				
				if (oldMember.nickname !== newMember.nickname) {
					changes.nickname = { old: oldMember.nickname || null, new: newMember.nickname || null };
				}
				
				if (oldMember.user.displayAvatarURL() !== newMember.user.displayAvatarURL()) {
					changes.avatar = { 
						old: oldMember.user.displayAvatarURL({ size: 128 }), 
						new: newMember.user.displayAvatarURL({ size: 128 })
					};
				}
				
				if (!oldMember.premiumSince && newMember.premiumSince) {
					changes.boost = { action: 'started', since: newMember.premiumSinceTimestamp };
				} else if (oldMember.premiumSince && !newMember.premiumSince) {
					changes.boost = { action: 'stopped' };
				}
				
				if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {
					if (newMember.communicationDisabledUntilTimestamp) {
						changes.timeout = { 
							until: newMember.communicationDisabledUntilTimestamp,
							duration: Math.floor((newMember.communicationDisabledUntilTimestamp - Date.now()) / 1000 / 60) + ' minutes'
						};
					} else {
						changes.timeout = { removed: true };
					}
				}
				
				const oldRoles = oldMember.roles.cache.map(r => ({ id: r.id, name: r.name })).sort((a, b) => a.id.localeCompare(b.id));
				const newRoles = newMember.roles.cache.map(r => ({ id: r.id, name: r.name })).sort((a, b) => a.id.localeCompare(b.id));
				if (JSON.stringify(oldRoles.map(r => r.id)) !== JSON.stringify(newRoles.map(r => r.id))) {
					const addedRoles = newRoles.filter(r => !oldRoles.find(o => o.id === r.id));
					const removedRoles = oldRoles.filter(r => !newRoles.find(n => n.id === r.id));
					changes.roles = { 
						added: addedRoles.map(r => ({ id: r.id, name: r.name })), 
						removed: removedRoles.map(r => ({ id: r.id, name: r.name }))
					};
				}
				
				if (Object.keys(changes).length > 0) {
					await global.eventsDatabase.events.create({
						event_name: 'GuildMemberUpdate',
						user_id: newMember.id,
						user_name: newMember.user.username,
						user_avatar: newMember.user.displayAvatarURL({ size: 128 }),
						guild_id: newMember.guild.id,
						event_data: JSON.stringify(changes),
						timestamp: Date.now()
					});
				}
			} catch (err) {
				console.reportError('Error recording GuildMemberUpdate:', err.message);
			}
		}
	}
}