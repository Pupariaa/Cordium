'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "memberId", type: "string", mandatory: true, range: [17, 20] },
		{ name: "duration", type: "int", mandatory: false, range: [1, 40320] }, // Max 28 days in minutes
		{ name: "reason", type: "string", mandatory: false, range: [0, 512] },
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

			if (member.id === global.guild.ownerId) {
				return { status_code: 403, error: 'Cannot timeout the server owner' };
			}

			const duration = params.duration || 10; // Default 10 minutes
			const timeoutUntil = Date.now() + (duration * 60 * 1000);

			await member.timeout(timeoutUntil, params.reason || 'No reason provided');

			return {
				status_code: 200,
				timeout: {
					id: member.id,
					name: member.displayName,
					duration: duration,
					until: timeoutUntil,
					reason: params.reason || 'No reason provided'
				}
			};
		} catch (err) {
			console.reportError('Error in timeout_member:', err);
			return { status_code: 500, error: err.message };
		}
	},
};


