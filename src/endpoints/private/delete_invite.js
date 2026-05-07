'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "inviteCode", type: "string", mandatory: true, range: [1, 50] },
	],
	handler: async function (params) {
		try {
			if (!global.guild) {
				return { status_code: 503, error: 'Bot not connected to guild' };
			}

			const invite = await global.guild.invites.fetch(params.inviteCode);
			if (!invite) {
				return { status_code: 404, error: 'Invite not found' };
			}

			await invite.delete();

			return {
				status_code: 200,
				deleted: {
					code: params.inviteCode
				}
			};
		} catch (err) {
			console.reportError('Error in delete_invite:', err);
			return { status_code: 500, error: err.message };
		}
	},
};







