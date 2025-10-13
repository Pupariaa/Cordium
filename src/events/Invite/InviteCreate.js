'use strict';

module.exports = {
	listen: true,
	report: true,
	callback: async function (invite) {
		if (global.eventsDatabase && global.eventsDatabaseOnline) {
			try {
				await global.eventsDatabase.events.create({
					event_name: 'InviteCreate',
					user_id: invite.inviter?.id,
					user_name: invite.inviter?.username,
					user_avatar: invite.inviter?.displayAvatarURL({ size: 128 }),
					guild_id: invite.guild?.id,
					channel_id: invite.channel?.id,
					event_data: JSON.stringify({
						code: invite.code,
						maxUses: invite.maxUses,
						expiresAt: invite.expiresTimestamp,
						channelName: invite.channel?.name
					}),
					timestamp: Date.now()
				});
			} catch (err) {
				console.reportError('Error recording InviteCreate:', err.message);
			}
		}
	}
}