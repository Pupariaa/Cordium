'use strict';

module.exports = {
	listen: true,
	report: true,
	callback: async function (oldState, newState) {
		if (global.eventsDatabase && global.eventsDatabaseOnline) {
			try {
				const changes = {};
				
				if (oldState.channelId !== newState.channelId) {
					if (!oldState.channelId && newState.channelId) {
						changes.action = 'join';
						changes.channelId = newState.channelId;
						changes.channelName = newState.channel?.name;
					} else if (oldState.channelId && !newState.channelId) {
						changes.action = 'leave';
						changes.channelId = oldState.channelId;
						changes.channelName = oldState.channel?.name;
					} else {
						changes.action = 'move';
						changes.oldChannelId = oldState.channelId;
						changes.newChannelId = newState.channelId;
						changes.oldChannelName = oldState.channel?.name;
						changes.newChannelName = newState.channel?.name;
					}
				}
				
				if (oldState.serverMute !== newState.serverMute) {
					changes.serverMute = { old: oldState.serverMute, new: newState.serverMute };
				}
				
				if (oldState.serverDeaf !== newState.serverDeaf) {
					changes.serverDeaf = { old: oldState.serverDeaf, new: newState.serverDeaf };
				}
				
				if (oldState.streaming !== newState.streaming) {
					changes.streaming = { old: oldState.streaming, new: newState.streaming };
				}
				
				if (oldState.selfVideo !== newState.selfVideo) {
					changes.camera = { old: oldState.selfVideo, new: newState.selfVideo };
				}
				
				if (oldState.selfMute !== newState.selfMute) {
					changes.selfMute = { old: oldState.selfMute, new: newState.selfMute };
				}
				
				if (oldState.selfDeaf !== newState.selfDeaf) {
					changes.selfDeaf = { old: oldState.selfDeaf, new: newState.selfDeaf };
				}
				
				if (Object.keys(changes).length > 0) {
					await global.eventsDatabase.events.create({
						event_name: 'VoiceStateUpdate',
						user_id: newState.member.id,
						user_name: newState.member.user.username,
						user_avatar: newState.member.user.displayAvatarURL({ size: 128 }),
						guild_id: newState.guild.id,
						channel_id: newState.channelId || oldState.channelId,
						event_data: JSON.stringify(changes),
						timestamp: Date.now()
					});
				}
			} catch (err) {
				console.reportError('Error recording VoiceStateUpdate:', err.message);
			}
		}
	}
}