'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
	],
	handler: async function (params) {
		try {
			if (!global.guild) {
				return { status_code: 503, error: 'Bot not connected to guild' };
			}

			const invites = await global.guild.invites.fetch();

			const invitesList = invites.map(invite => ({
				code: invite.code,
				url: invite.url,
				channelId: invite.channel?.id,
				channelName: invite.channel?.name,
				inviterId: invite.inviter?.id,
				inviterUsername: invite.inviter?.username,
				uses: invite.uses,
				maxUses: invite.maxUses,
				maxAge: invite.maxAge,
				temporary: invite.temporary,
				createdAt: invite.createdTimestamp,
				expiresAt: invite.expiresTimestamp
			}));

			return {
				status_code: 200,
				invites: invitesList,
				count: invitesList.length
			};
		} catch (err) {
			console.reportError('Error in get_invites:', err);
			return { status_code: 500, error: err.message };
		}
	},
};

