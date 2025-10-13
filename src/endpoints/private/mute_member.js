'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "memberId", type: "string", mandatory: true, range: [17, 20] },
		{ name: "mute", type: "boolean", mandatory: false },
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

			if (!member.voice.channel) {
				return { status_code: 400, error: 'Member is not in a voice channel' };
			}

			const shouldMute = params.mute !== undefined ? params.mute : !member.voice.mute;
			await member.voice.setMute(shouldMute);

			return {
				status_code: 200,
				member: {
					id: member.id,
					displayName: member.displayName,
					muted: shouldMute
				}
			};
		} catch (err) {
			console.reportError('Error in mute_member:', err);
			return { status_code: 500, error: err.message };
		}
	},
};

