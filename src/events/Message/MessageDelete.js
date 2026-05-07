'use strict';

module.exports = {
	listen: true,
	report: true,
	callback: async function (message) {
		// Try to get message content from cache or database before marking as deleted
		let messageContent = message.content;
		let messageAuthor = message.author;

		if (global.messagesCache) {
			// Prepare message data for cache
			const messageDataForCache = {
				content: message.content,
				author: message.author,
				authorId: message.author?.id,
				authorUsername: message.author?.username,
				authorDisplayName: message.author?.displayName || message.author?.username,
				authorAvatar: message.author?.displayAvatarURL?.({ size: 64 }),
				channel: message.channel,
				channelId: message.channel?.id,
				channelName: message.channel?.name,
				timestamp: message.createdTimestamp,
				attachments: message.attachments?.map(a => ({
					url: a.url,
					name: a.name,
					contentType: a.contentType
				})) || [],
				embeds: message.embeds?.length || 0,
				hasThread: message.hasThread || false,
				pinned: message.pinned || false,
				type: message.type || 0,
				reactions: []
			};

			// Check if message exists in cache to preserve full data
			try {
				if (global.redisOnline) {
					const allMessages = await global.redisManager.client.zRange(global.messagesCache.messagesList, 0, -1);
					for (const msg of allMessages) {
						const parsed = JSON.parse(msg);
						if (parsed.id === message.id) {
							// Found in cache, use cached data for better preservation
							messageContent = parsed.content || messageContent;
							messageDataForCache.content = parsed.content || messageDataForCache.content;
							messageDataForCache.authorId = parsed.authorId || messageDataForCache.authorId;
							messageDataForCache.authorUsername = parsed.authorUsername || messageDataForCache.authorUsername;
							messageDataForCache.authorDisplayName = parsed.authorDisplayName || messageDataForCache.authorDisplayName;
							messageDataForCache.authorAvatar = parsed.authorAvatar || messageDataForCache.authorAvatar;
							if (!messageAuthor && parsed.authorId) {
								const member = message.guild?.members?.cache?.get(parsed.authorId);
								if (member) messageAuthor = member.user;
							}
							break;
						}
					}
				} else {
					const cachedMsg = global.messagesCache.ramCache.messages.find(m => m.id === message.id);
					if (cachedMsg) {
						messageContent = cachedMsg.content || messageContent;
						messageDataForCache.content = cachedMsg.content || messageDataForCache.content;
						messageDataForCache.authorId = cachedMsg.authorId || messageDataForCache.authorId;
						messageDataForCache.authorUsername = cachedMsg.authorUsername || messageDataForCache.authorUsername;
						messageDataForCache.authorDisplayName = cachedMsg.authorDisplayName || messageDataForCache.authorDisplayName;
						messageDataForCache.authorAvatar = cachedMsg.authorAvatar || messageDataForCache.authorAvatar;
						if (!messageAuthor && cachedMsg.authorId) {
							const member = message.guild?.members?.cache?.get(cachedMsg.authorId);
							if (member) messageAuthor = member.user;
						}
					}
				}
			} catch (err) {
				console.reportError('Error checking cache for deleted message:', err);
			}

			// Mark as deleted (will add to cache if not exists)
			await global.messagesCache.deleteMessage(message.id, messageDataForCache);
		}

		if (global.eventsDatabase && global.eventsDatabaseOnline) {
			try {
				await global.eventsDatabase.events.create({
					event_name: 'MessageDelete',
					user_id: messageAuthor?.id,
					user_name: messageAuthor?.username,
					user_avatar: messageAuthor?.displayAvatarURL({ size: 128 }),
					guild_id: message.guild?.id,
					channel_id: message.channel.id,
					message_id: message.id,
					event_data: JSON.stringify({
						content: messageContent?.substring(0, 500) || '[Unknown content]'
					}),
					timestamp: Date.now()
				});
			} catch (err) {
				console.reportError('Error recording MessageDelete:', err.message);
			}
		}
	}
}