'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "memberId", type: "string", mandatory: true, range: [17, 20] },
		{ name: "nickname", type: "string", mandatory: false, range: [0, 32] },
	],
	handler: async function (params) {
		try {
			if (!global.guild) {
				return { status_code: 503, error: 'Bot not connected to guild' };
			}

			const member = await global.guild.members.fetch(params.memberId);
			if (!member) {
				return { status_code: 404, error: 'Member not found' };
			}

			await member.setNickname(params.nickname || null);

			return {
				status_code: 200,
				member: {
					id: member.id,
					username: member.user.username,
					displayName: member.displayName,
					nickname: member.nickname
				}
			};
		} catch (err) {
			console.reportError('Error in change_nickname:', err);
			return { status_code: 500, error: err.message };
		}
	},
};







