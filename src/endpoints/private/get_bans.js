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

			const bans = await global.guild.bans.fetch();

			const bansList = bans.map(ban => ({
				userId: ban.user.id,
				username: ban.user.username,
				discriminator: ban.user.discriminator,
				reason: ban.reason || 'No reason provided'
			}));

			return {
				status_code: 200,
				bans: bansList,
				count: bansList.length
			};
		} catch (err) {
			console.reportError('Error in get_bans:', err);
			return { status_code: 500, error: err.message };
		}
	},
};







