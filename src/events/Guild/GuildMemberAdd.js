'use strict';

module.exports = {
	listen: true,
	report: true,
	callback: async function (member) {
		if (global.eventsDatabase && global.eventsDatabaseOnline) {
			try {
				await global.eventsDatabase.events.create({
					event_name: 'GuildMemberAdd',
					user_id: member.id,
					user_name: member.user.username,
					user_avatar: member.user.displayAvatarURL({ size: 128 }),
					guild_id: member.guild.id,
					event_data: JSON.stringify({
						joinedAt: member.joinedTimestamp,
						accountCreatedAt: member.user.createdTimestamp,
						bot: member.user.bot
					}),
					timestamp: Date.now()
				});
			} catch (err) {
				console.reportError('Error recording GuildMemberAdd:', err.message);
			}
		}

		if (global.configJson && global.configJson.autoRoles && Array.isArray(global.configJson.autoRoles) && global.configJson.autoRoles.length > 0) {
			try {
				const autoRoleNames = global.configJson.autoRoles;
				const rolesToAdd = [];

				for (const roleName of autoRoleNames) {
					const role = member.guild.roles.cache.find(r => r.name === roleName);
					if (role) {
						rolesToAdd.push(role);
					}
				}

				if (rolesToAdd.length > 0) {
					await member.roles.add(rolesToAdd);
					const roleNames = rolesToAdd.map(r => r.name).join(', ');
					console.log(`Auto-assigned roles "${roleNames}" to ${member.user.tag}`);
				}
			} catch (err) {
				console.reportError(`Error auto-assigning roles to ${member.user.tag}:`, err.message);
			}
		}
	}
}