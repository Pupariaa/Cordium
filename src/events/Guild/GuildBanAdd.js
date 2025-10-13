'use strict';

module.exports = {
	listen: true,
	report: true,
	callback: async function (ban) {
		if (global.eventsDatabase && global.eventsDatabaseOnline) {
			try {
				let executor = null;

				try {
					const auditLogs = await ban.guild.fetchAuditLogs({
						limit: 1,
						type: 22
					});

					const banLog = auditLogs.entries.first();

					if (banLog && banLog.target.id === ban.user.id && Date.now() - banLog.createdTimestamp < 5000) {
						executor = {
							id: banLog.executor.id,
							username: banLog.executor.username,
							avatar: banLog.executor.displayAvatarURL({ size: 128 })
						};
					}
				} catch (err) {
					console.reportError('Error fetching audit logs for GuildBanAdd:', err.message);
				}

				await global.eventsDatabase.events.create({
					event_name: 'GuildBanAdd',
					user_id: ban.user.id,
					user_name: ban.user.username,
					user_avatar: ban.user.displayAvatarURL({ size: 128 }),
					guild_id: ban.guild.id,
					event_data: JSON.stringify({
						reason: ban.reason || 'No reason provided',
						executor: executor
					}),
					timestamp: Date.now()
				});
			} catch (err) {
				console.reportError('Error recording GuildBanAdd:', err.message);
			}
		}
	}
}