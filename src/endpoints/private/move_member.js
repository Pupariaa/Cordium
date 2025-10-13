'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "memberId", type: "string", mandatory: true, range: [17, 20] },
		{ name: "channelId", type: "string", mandatory: false, range: [17, 20] },
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

			if (params.channelId) {
				const targetChannel = global.guild.channels.cache.get(params.channelId);
				if (!targetChannel) {
					return { status_code: 404, error: 'Target channel not found' };
				}

				if (targetChannel.type !== 2) { // Voice channel
					return { status_code: 400, error: 'Target must be a voice channel' };
				}

				await member.voice.setChannel(targetChannel);
			} else {
				// Disconnect from voice
				await member.voice.disconnect();
			}

			return {
				status_code: 200,
				member: {
					id: member.id,
					displayName: member.displayName,
					channelId: member.voice.channel?.id || null
				}
			};
		} catch (err) {
			console.reportError('Error in move_member:', err);
			return { status_code: 500, error: err.message };
		}
	},
};


