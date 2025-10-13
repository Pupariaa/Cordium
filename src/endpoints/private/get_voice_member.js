'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "memberId", type: "string", mandatory: true, range: [17, 20] },
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

			const voiceState = member.voice;

			if (!voiceState || !voiceState.channel) {
				return {
					status_code: 200,
					inVoice: false,
					member: {
						id: member.id,
						displayName: member.displayName
					}
				};
			}

			return {
				status_code: 200,
				inVoice: true,
				member: {
					id: member.id,
					displayName: member.displayName
				},
				voice: {
					channelId: voiceState.channel.id,
					channelName: voiceState.channel.name,
					muted: voiceState.mute,
					deafened: voiceState.deaf,
					selfMuted: voiceState.selfMute,
					selfDeafened: voiceState.selfDeaf,
					streaming: voiceState.streaming,
					videoEnabled: voiceState.selfVideo,
					sessionId: voiceState.sessionId
				}
			};
		} catch (err) {
			console.reportError('Error in get_voice_member:', err);
			return { status_code: 500, error: err.message };
		}
	},
};
