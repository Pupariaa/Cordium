'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "memberId", type: "string", mandatory: true, range: [17, 20] },
		{ name: "reason", type: "string", mandatory: false, range: [0, 512] },
		{ name: "deleteMessageDays", type: "int", mandatory: false, range: [0, 7] },
	],
	handler: async function (params) {
		try {
			if (!global.guild) {
				return { status_code: 503, error: 'Bot not connected to guild' };
			}

			const member = await global.guild.members.fetch(params.memberId).catch(() => null);

			if (member && member.id === global.guild.ownerId) {
				return { status_code: 403, error: 'Cannot ban the server owner' };
			}

			const memberName = member ? member.displayName : params.memberId;

			await global.guild.members.ban(params.memberId, {
				reason: params.reason || 'No reason provided',
				deleteMessageDays: params.deleteMessageDays || 0
			});

			return {
				status_code: 200,
				banned: {
					id: params.memberId,
					name: memberName,
					reason: params.reason || 'No reason provided',
					deleteMessageDays: params.deleteMessageDays || 0
				}
			};
		} catch (err) {
			console.reportError('Error in ban_member:', err);
			return { status_code: 500, error: err.message };
		}
	},
};

