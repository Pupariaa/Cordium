'use strict';

module.exports = {
	listen: true,
	report: true,
	callback: async function (member) {
		if (global.eventsDatabase && global.eventsDatabaseOnline) {
			try {
				let reason = 'left';
				let executor = null;

				try {
					const auditLogs = await member.guild.fetchAuditLogs({
						limit: 1,
						type: 20
					});

					const kickLog = auditLogs.entries.first();

					if (kickLog && kickLog.target.id === member.id && Date.now() - kickLog.createdTimestamp < 5000) {
						reason = 'kicked';
						executor = {
							id: kickLog.executor.id,
							username: kickLog.executor.username,
							avatar: kickLog.executor.displayAvatarURL({ size: 128 })
						};
					}
				} catch (err) {
					console.reportError('Error fetching audit logs for GuildMemberRemove:', err.message);
				}

				await global.eventsDatabase.events.create({
					event_name: 'GuildMemberRemove',
					user_id: member.id,
					user_name: member.user.username,
					user_avatar: member.user.displayAvatarURL({ size: 128 }),
					guild_id: member.guild.id,
					event_data: JSON.stringify({
						joinedAt: member.joinedTimestamp,
						leftAt: Date.now(),
						roles: member.roles.cache.map(r => ({ id: r.id, name: r.name })),
						reason: reason,
						executor: executor
					}),
					timestamp: Date.now()
				});
			} catch (err) {
				console.reportError('Error recording GuildMemberRemove:', err.message);
			}
		}
	}
}