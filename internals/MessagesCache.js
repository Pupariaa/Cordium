'use strict';

class MessagesCache {
	constructor() {
		this.messagesList = 'messages:list';
		this.priorityMessages = 'messages:priority';
		this.messageHistory = 'messages:history:'; // + messageId
		this.messageReactions = 'messages:reactions:'; // + messageId
		this.messageReplies = 'messages:replies:'; // + messageId
		this.loadingProgress = {
			isLoading: false,
			currentDate: null,
			loaded: 0
		};
	}

	async addMessage(message) {
		if (!global.redisOnline) return false;

		try {
			const reactions = [];
			if (message.reactions && message.reactions.cache.size > 0) {
				message.reactions.cache.forEach(reaction => {
					reactions.push({
						emoji: reaction.emoji.name,
						count: reaction.count,
						isCustom: reaction.emoji.id !== null,
						emojiId: reaction.emoji.id,
						emojiUrl: reaction.emoji.id ? `https://cdn.discordapp.com/emojis/${reaction.emoji.id}.png` : null
					});

					// Also store initial reactions in history
					if (reaction.count > 0) {
						const reactionEvent = {
							userId: 'BULK',
							username: 'Initial',
							emoji: reaction.emoji.name,
							emojiId: reaction.emoji.id,
							emojiUrl: reaction.emoji.id ? `https://cdn.discordapp.com/emojis/${reaction.emoji.id}.png` : null,
							action: 'add',
							timestamp: message.createdTimestamp,
							type: 'reaction',
							count: reaction.count
						};

						global.redisManager.client.rPush(
							this.messageReactions + message.id,
							JSON.stringify(reactionEvent)
						).catch(err => console.reportError('Error storing initial reactions:', err));
					}
				});
			}

			const attachments = message.attachments.map(a => {
				const attachment = {
					url: a.url,
					name: a.name,
					contentType: a.contentType,
					width: a.width,
					height: a.height,
					isImage: a.contentType && a.contentType.startsWith('image/')
				};

				if (global.saveAttachments && global.attachmentsManager) {
					const savedInfo = global.attachmentsManager.getAttachments(message.id);
					if (savedInfo) {
						attachment.localPath = `/files/${savedInfo.filename}`;
						attachment.savedLocally = true;
					}
				}

				return attachment;
			});

			const messageData = {
				id: message.id,
				content: message.content,
				authorId: message.author.id,
				authorUsername: message.author.username,
				authorDisplayName: message.author.displayName || message.author.username,
				authorAvatar: message.author.displayAvatarURL({ size: 64 }),
				channelId: message.channel.id,
				channelName: message.channel.name,
				timestamp: message.createdTimestamp,
				attachments: attachments,
				embeds: message.embeds.length,
				hasThread: message.hasThread,
				pinned: message.pinned,
				type: message.type,
				reactions: reactions
			};

			await global.redisManager.client.zAdd(this.messagesList, {
				score: message.createdTimestamp,
				value: JSON.stringify(messageData)
			});

			return true;
		} catch (err) {
			console.reportError('Error adding message to cache:', err);
			return false;
		}
	}

	async getMessages(limit = 30, before = null) {
		if (!global.redisOnline) {
			return { messages: [], hasMore: false };
		}

		try {
			const start = before ? before + 1 : 0;
			const end = start + limit - 1;

			const messages = await global.redisManager.client.zRange(
				this.messagesList,
				start,
				end,
				{
					REV: true
				}
			);

			const parsedMessages = messages.map(m => JSON.parse(m));
			const hasMore = messages.length === limit;

			return {
				messages: parsedMessages,
				hasMore: hasMore,
				offset: before ? before + limit : limit
			};
		} catch (err) {
			console.reportError('Error getting messages from cache:', err);
			return { messages: [], hasMore: false };
		}
	}

	async updateMessage(message) {
		if (!global.redisOnline) return false;

		try {
			// Find and remove old message
			const allMessages = await global.redisManager.client.zRange(this.messagesList, 0, -1);

			for (const msg of allMessages) {
				const parsed = JSON.parse(msg);
				if (parsed.id === message.id) {
					// Remove old version
					await global.redisManager.client.zRem(this.messagesList, msg);

					// Add updated version
					const reactions = [];
					if (message.reactions && message.reactions.cache.size > 0) {
						message.reactions.cache.forEach(reaction => {
							reactions.push({
								emoji: reaction.emoji.name,
								count: reaction.count,
								isCustom: reaction.emoji.id !== null,
								emojiId: reaction.emoji.id,
								emojiUrl: reaction.emoji.id ? `https://cdn.discordapp.com/emojis/${reaction.emoji.id}.png` : null
							});
						});
					}

					const attachments = message.attachments.map(a => {
						const attachment = {
							url: a.url,
							name: a.name,
							contentType: a.contentType,
							width: a.width,
							height: a.height,
							isImage: a.contentType && a.contentType.startsWith('image/')
						};

						if (global.saveAttachments && global.attachmentsManager) {
							const savedInfo = global.attachmentsManager.getAttachments(message.id);
							if (savedInfo) {
								attachment.localPath = `/files/${savedInfo.filename}`;
								attachment.savedLocally = true;
							}
						}

						return attachment;
					});

					const messageData = {
						id: message.id,
						content: message.content,
						authorId: message.author.id,
						authorUsername: message.author.username,
						authorDisplayName: message.author.displayName || message.author.username,
						authorAvatar: message.author.displayAvatarURL({ size: 64 }),
						channelId: message.channel.id,
						channelName: message.channel.name,
						timestamp: message.createdTimestamp,
						attachments: attachments,
						embeds: message.embeds.length,
						hasThread: message.hasThread,
						pinned: message.pinned,
						type: message.type,
						reactions: reactions,
						edited: message.editedTimestamp ? true : false,
						editedAt: message.editedTimestamp
					};

					await global.redisManager.client.zAdd(this.messagesList, {
						score: message.createdTimestamp,
						value: JSON.stringify(messageData)
					});

					return true;
				}
			}

			return false;
		} catch (err) {
			console.reportError('Error updating message in cache:', err);
			return false;
		}
	}

	async deleteMessage(messageId) {
		if (!global.redisOnline) return false;

		try {
			const allMessages = await global.redisManager.client.zRange(this.messagesList, 0, -1);

			for (const msg of allMessages) {
				const parsed = JSON.parse(msg);
				if (parsed.id === messageId) {
					await global.redisManager.client.zRem(this.messagesList, msg);
					return true;
				}
			}

			return false;
		} catch (err) {
			console.reportError('Error deleting message from cache:', err);
			return false;
		}
	}

	async getStats() {
		if (!global.redisOnline) return { total: 0, enabled: false };

		try {
			const total = await global.redisManager.client.zCard(this.messagesList);
			const oldest = await global.redisManager.client.zRange(this.messagesList, 0, 0);
			const newest = await global.redisManager.client.zRange(this.messagesList, -1, -1);

			return {
				total,
				enabled: true,
				oldest: oldest.length > 0 ? JSON.parse(oldest[0]) : null,
				newest: newest.length > 0 ? JSON.parse(newest[0]) : null
			};
		} catch (err) {
			console.reportError('Error getting messages stats:', err);
			return { total: 0, enabled: false };
		}
	}

	async addMessageEdit(messageId, oldContent, newContent, editedAt) {
		if (!global.redisOnline) return false;

		try {
			const edit = {
				oldContent,
				newContent,
				timestamp: editedAt,
				type: 'edit'
			};

			await global.redisManager.client.rPush(
				this.messageHistory + messageId,
				JSON.stringify(edit)
			);

			return true;
		} catch (err) {
			console.reportError('Error adding message edit:', err);
			return false;
		}
	}

	async addReactionEvent(messageId, userId, username, emoji, emojiId, action, timestamp) {
		if (!global.redisOnline) return false;

		try {
			const reactionEvent = {
				userId,
				username,
				emoji,
				emojiId,
				emojiUrl: emojiId ? `https://cdn.discordapp.com/emojis/${emojiId}.png` : null,
				action, // 'add' or 'remove'
				timestamp,
				type: 'reaction'
			};

			await global.redisManager.client.rPush(
				this.messageReactions + messageId,
				JSON.stringify(reactionEvent)
			);

			return true;
		} catch (err) {
			console.reportError('Error adding reaction event:', err);
			return false;
		}
	}

	async addReply(messageId, replyData) {
		if (!global.redisOnline) return false;

		try {
			await global.redisManager.client.rPush(
				this.messageReplies + messageId,
				JSON.stringify(replyData)
			);

			return true;
		} catch (err) {
			console.reportError('Error adding reply:', err);
			return false;
		}
	}

	async getMessageHistory(messageId) {
		if (!global.redisOnline) return { edits: [], reactions: [], replies: [] };

		try {
			const edits = await global.redisManager.client.lRange(
				this.messageHistory + messageId,
				0,
				-1
			);

			const reactions = await global.redisManager.client.lRange(
				this.messageReactions + messageId,
				0,
				-1
			);

			const replies = await global.redisManager.client.lRange(
				this.messageReplies + messageId,
				0,
				-1
			);

			return {
				edits: edits.map(e => JSON.parse(e)),
				reactions: reactions.map(r => JSON.parse(r)),
				replies: replies.map(r => JSON.parse(r))
			};
		} catch (err) {
			console.reportError('Error getting message history:', err);
			return { edits: [], reactions: [], replies: [] };
		}
	}

	async setPriority(messageId, isPriority = true) {
		if (!global.redisOnline) return false;

		try {
			if (isPriority) {
				await global.redisManager.client.sAdd(this.priorityMessages, messageId);
			} else {
				await global.redisManager.client.sRem(this.priorityMessages, messageId);
			}
			return true;
		} catch (err) {
			console.reportError('Error setting message priority:', err);
			return false;
		}
	}

	async isPriority(messageId) {
		if (!global.redisOnline) return false;
		try {
			return await global.redisManager.client.sIsMember(this.priorityMessages, messageId);
		} catch (err) {
			return false;
		}
	}

	async restoreToDiscordCache() {
		if (!global.redisOnline) return;

		try {
			console.report('Starting progressive message restoration...');

			const priorityIds = await global.redisManager.client.sMembers(this.priorityMessages);
			console.report(`Loading ${priorityIds.length} priority messages first...`);

			let priorityRestored = 0;
			const channelCache = new Map();

			for (const msgId of priorityIds) {
				const allMessages = await global.redisManager.client.zRange(this.messagesList, 0, -1);
				const msgData = allMessages.find(m => JSON.parse(m).id === msgId);

				if (!msgData) continue;

				const msg = JSON.parse(msgData);
				let channel = channelCache.get(msg.channelId);

				if (!channel) {
					channel = global.guild.channels.cache.get(msg.channelId);
					if (!channel || !channel.isTextBased()) continue;
					channelCache.set(msg.channelId, channel);
				}

				try {
					await channel.messages.fetch(msg.id);
					priorityRestored++;
				} catch (err) {
				}
			}

			console.report(`Priority messages restored: ${priorityRestored}`);

			console.report('Loading recent messages from all channels...');
			let recentRestored = 0;

			for (const [channelId, channel] of global.guild.channels.cache) {
				if (!channel.isTextBased()) continue;

				try {
					const messages = await channel.messages.fetch({ limit: 50 });
					recentRestored += messages.size;
				} catch (err) {
				}
			}

			console.report(`Recent messages restored: ${recentRestored}`);
			console.report(`Total restored: ${priorityRestored + recentRestored} messages`);

			this.startProgressiveLoading();
		} catch (err) {
			console.reportError('Error restoring messages:', err);
		}
	}

	async startProgressiveLoading() {
		if (this.loadingProgress.isLoading) return;

		this.loadingProgress.isLoading = true;
		const threeMonthsAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);

		console.report('Starting background progressive loading (3 month window)...');

		setInterval(async () => {
			if (!global.redisOnline) {
				this.loadingProgress.isLoading = false;
				return;
			}

			try {
				for (const [channelId, channel] of global.guild.channels.cache) {
					if (!channel.isTextBased()) continue;

					const cachedMessages = channel.messages.cache;
					if (cachedMessages.size === 0) continue;

					const oldestCached = cachedMessages.last();
					if (!oldestCached || oldestCached.createdTimestamp < threeMonthsAgo) continue;

					try {
						const olderMessages = await channel.messages.fetch({
							limit: 50,
							before: oldestCached.id
						});

						if (olderMessages.size > 0) {
							this.loadingProgress.loaded += olderMessages.size;
						}
					} catch (err) {
					}
				}
			} catch (err) {
			}
		}, 60000);
	}
}

module.exports = MessagesCache;

