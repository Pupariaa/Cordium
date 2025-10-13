'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "userId", type: "string", mandatory: true, range: [17, 20] },
		{ name: "reason", type: "string", mandatory: false, range: [0, 512] },
	],
	handler: async function (params) {
		try {
			if (!global.guild) {
				return { status_code: 503, error: 'Bot not connected to guild' };
			}

			await global.guild.members.unban(params.userId, params.reason || 'Unbanned via API');

			return {
				status_code: 200,
				unbanned: {
					id: params.userId,
					reason: params.reason || 'Unbanned via API'
				}
			};
		} catch (err) {
			console.reportError('Error in unban_member:', err);
			return { status_code: 500, error: err.message };
		}
	},
};

