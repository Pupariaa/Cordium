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

		this.ramCache = {
			messages: [],
			priority: new Set(),
			history: new Map(),
			reactions: new Map(),
			replies: new Map()
		};

		const isStandalone = process.env.db_type === 'sqlite' && !process.env.redis_host;
		console.report(`MessagesCache mode: ${isStandalone ? 'RAM (Standalone)' : 'Redis (Component)'}`);
	}

	async addMessage(message) {
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

						if (global.redisOnline) {
							global.redisManager.client.rPush(
								this.messageReactions + message.id,
								JSON.stringify(reactionEvent)
							).catch(err => console.reportError('Error storing initial reactions:', err));
						} else {
							if (!this.ramCache.reactions.has(message.id)) {
								this.ramCache.reactions.set(message.id, []);
							}
							this.ramCache.reactions.get(message.id).push(reactionEvent);
						}
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

			if (global.redisOnline) {
				await global.redisManager.client.zAdd(this.messagesList, {
					score: message.createdTimestamp,
					value: JSON.stringify(messageData)
				});
			} else {
				this.ramCache.messages.push(messageData);
				this.ramCache.messages.sort((a, b) => b.timestamp - a.timestamp);

				if (this.ramCache.messages.length > 10000) {
					this.ramCache.messages = this.ramCache.messages.slice(0, 10000);
				}
			}

			return true;
		} catch (err) {
			console.reportError('Error adding message to cache:', err);
			return false;
		}
	}

	async getMessages(limit = 30, before = null) {
		try {
			if (global.redisOnline) {
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
			} else {
				const start = before || 0;
				const messages = this.ramCache.messages.slice(start, start + limit);
				const hasMore = this.ramCache.messages.length > start + limit;

				return {
					messages: messages,
					hasMore: hasMore,
					offset: start + limit
				};
			}
		} catch (err) {
			console.reportError('Error getting messages from cache:', err);
			return { messages: [], hasMore: false };
		}
	}

	async updateMessage(message) {
		try {
			if (global.redisOnline) {
				const allMessages = await global.redisManager.client.zRange(this.messagesList, 0, -1);

				for (const msg of allMessages) {
					const parsed = JSON.parse(msg);
					if (parsed.id === message.id) {
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
			} else {
				const idx = this.ramCache.messages.findIndex(m => m.id === message.id);
				if (idx !== -1) {
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

					this.ramCache.messages[idx] = messageData;
					return true;
				}
			}

			return false;
		} catch (err) {
			console.reportError('Error updating message in cache:', err);
			return false;
		}
	}

	async deleteMessage(messageId, messageData = null) {
		try {
			const deletedTimestamp = Date.now();
			let found = false;

			if (global.redisOnline) {
				const allMessages = await global.redisManager.client.zRange(this.messagesList, 0, -1);

				for (const msg of allMessages) {
					const parsed = JSON.parse(msg);
					if (parsed.id === messageId) {
						// Mark as deleted instead of removing - preserve all data
						parsed.deleted = true;
						parsed.deletedAt = deletedTimestamp;
						await global.redisManager.client.zRem(this.messagesList, msg);
						await global.redisManager.client.zAdd(this.messagesList, {
							score: parsed.timestamp,
							value: JSON.stringify(parsed)
						});
						found = true;
						break;
					}
				}

				// If message not found in cache and we have messageData, add it as deleted
				if (!found && messageData) {
					const deletedMessage = {
						id: messageId,
						content: messageData.content || '[Message content unavailable]',
						authorId: messageData.authorId || messageData.author?.id,
						authorUsername: messageData.authorUsername || messageData.author?.username || 'Unknown',
						authorDisplayName: messageData.authorDisplayName || messageData.author?.displayName || messageData.author?.username || 'Unknown',
						authorAvatar: messageData.authorAvatar || messageData.author?.displayAvatarURL?.({ size: 64 }) || 'https://cdn.discordapp.com/embed/avatars/0.png',
						channelId: messageData.channelId || messageData.channel?.id,
						channelName: messageData.channelName || messageData.channel?.name || 'Unknown',
						timestamp: messageData.timestamp || messageData.createdTimestamp || Date.now(),
						attachments: messageData.attachments || [],
						embeds: messageData.embeds || 0,
						hasThread: messageData.hasThread || false,
						pinned: messageData.pinned || false,
						type: messageData.type || 0,
						reactions: messageData.reactions || [],
						deleted: true,
						deletedAt: deletedTimestamp
					};

					await global.redisManager.client.zAdd(this.messagesList, {
						score: deletedMessage.timestamp,
						value: JSON.stringify(deletedMessage)
					});
					found = true;
				}
			} else {
				const idx = this.ramCache.messages.findIndex(m => m.id === messageId);
				if (idx !== -1) {
					// Mark as deleted instead of removing - preserve all data
					this.ramCache.messages[idx].deleted = true;
					this.ramCache.messages[idx].deletedAt = deletedTimestamp;
					found = true;
				} else if (messageData) {
					// Add message as deleted if not in cache
					const deletedMessage = {
						id: messageId,
						content: messageData.content || '[Message content unavailable]',
						authorId: messageData.authorId || messageData.author?.id,
						authorUsername: messageData.authorUsername || messageData.author?.username || 'Unknown',
						authorDisplayName: messageData.authorDisplayName || messageData.author?.displayName || messageData.author?.username || 'Unknown',
						authorAvatar: messageData.authorAvatar || messageData.author?.displayAvatarURL?.({ size: 64 }) || 'https://cdn.discordapp.com/embed/avatars/0.png',
						channelId: messageData.channelId || messageData.channel?.id,
						channelName: messageData.channelName || messageData.channel?.name || 'Unknown',
						timestamp: messageData.timestamp || messageData.createdTimestamp || Date.now(),
						attachments: messageData.attachments || [],
						embeds: messageData.embeds || 0,
						hasThread: messageData.hasThread || false,
						pinned: messageData.pinned || false,
						type: messageData.type || 0,
						reactions: messageData.reactions || [],
						deleted: true,
						deletedAt: deletedTimestamp
					};

					this.ramCache.messages.push(deletedMessage);
					this.ramCache.messages.sort((a, b) => b.timestamp - a.timestamp);

					if (this.ramCache.messages.length > 10000) {
						this.ramCache.messages = this.ramCache.messages.slice(0, 10000);
					}
					found = true;
				}
			}

			return found;
		} catch (err) {
			console.reportError('Error marking message as deleted in cache:', err);
			return false;
		}
	}

	async getStats() {
		try {
			if (global.redisOnline) {
				const total = await global.redisManager.client.zCard(this.messagesList);
				const oldest = await global.redisManager.client.zRange(this.messagesList, 0, 0);
				const newest = await global.redisManager.client.zRange(this.messagesList, -1, -1);

				return {
					totalMessages: total,
					total,
					enabled: true,
					oldest: oldest.length > 0 ? JSON.parse(oldest[0]) : null,
					newest: newest.length > 0 ? JSON.parse(newest[0]) : null
				};
			} else {
				const total = this.ramCache.messages.length;
				return {
					totalMessages: total,
					total,
					enabled: true,
					oldest: total > 0 ? this.ramCache.messages[total - 1] : null,
					newest: total > 0 ? this.ramCache.messages[0] : null
				};
			}
		} catch (err) {
			console.reportError('Error getting messages stats:', err);
			return { total: 0, enabled: false };
		}
	}

	async getChannelStats() {
		try {
			const channelCounts = {};

			if (global.redisOnline) {
				const messages = await global.redisManager.client.zRange(this.messagesList, 0, -1);
				messages.forEach(msgStr => {
					try {
						const msg = JSON.parse(msgStr);
						const channelId = msg.channelId || msg.channel;
						const channelName = msg.channelName || msg.channel || 'Unknown';

						if (!channelCounts[channelId]) {
							channelCounts[channelId] = {
								channelId: channelId,
								channelName: channelName,
								count: 0
							};
						}
						channelCounts[channelId].count++;
					} catch (e) {
					}
				});
			} else {
				this.ramCache.messages.forEach(msg => {
					const channelId = msg.channelId || msg.channel;
					const channelName = msg.channelName || msg.channel || 'Unknown';

					if (!channelCounts[channelId]) {
						channelCounts[channelId] = {
							channelId: channelId,
							channelName: channelName,
							count: 0
						};
					}
					channelCounts[channelId].count++;
				});
			}

			return Object.values(channelCounts).sort((a, b) => b.count - a.count);
		} catch (err) {
			console.reportError('Error getting channel stats:', err);
			return [];
		}
	}

	async addMessageEdit(messageId, oldContent, newContent, editedAt) {
		try {
			const edit = {
				oldContent,
				newContent,
				timestamp: editedAt,
				type: 'edit'
			};

			if (global.redisOnline) {
				await global.redisManager.client.rPush(
					this.messageHistory + messageId,
					JSON.stringify(edit)
				);
			} else {
				if (!this.ramCache.history.has(messageId)) {
					this.ramCache.history.set(messageId, []);
				}
				this.ramCache.history.get(messageId).push(edit);
			}

			return true;
		} catch (err) {
			console.reportError('Error adding message edit:', err);
			return false;
		}
	}

	async addReactionEvent(messageId, userId, username, emoji, emojiId, action, timestamp) {
		try {
			const reactionEvent = {
				userId,
				username,
				emoji,
				emojiId,
				emojiUrl: emojiId ? `https://cdn.discordapp.com/emojis/${emojiId}.png` : null,
				action,
				timestamp,
				type: 'reaction'
			};

			if (global.redisOnline) {
				await global.redisManager.client.rPush(
					this.messageReactions + messageId,
					JSON.stringify(reactionEvent)
				);
			} else {
				if (!this.ramCache.reactions.has(messageId)) {
					this.ramCache.reactions.set(messageId, []);
				}
				this.ramCache.reactions.get(messageId).push(reactionEvent);
			}

			return true;
		} catch (err) {
			console.reportError('Error adding reaction event:', err);
			return false;
		}
	}

	async addReply(messageId, replyData) {
		try {
			if (global.redisOnline) {
				await global.redisManager.client.rPush(
					this.messageReplies + messageId,
					JSON.stringify(replyData)
				);
			} else {
				if (!this.ramCache.replies.has(messageId)) {
					this.ramCache.replies.set(messageId, []);
				}
				this.ramCache.replies.get(messageId).push(replyData);
			}

			return true;
		} catch (err) {
			console.reportError('Error adding reply:', err);
			return false;
		}
	}

	async getMessageHistory(messageId) {
		try {
			if (global.redisOnline) {
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
			} else {
				return {
					edits: this.ramCache.history.get(messageId) || [],
					reactions: this.ramCache.reactions.get(messageId) || [],
					replies: this.ramCache.replies.get(messageId) || []
				};
			}
		} catch (err) {
			console.reportError('Error getting message history:', err);
			return { edits: [], reactions: [], replies: [] };
		}
	}

	async setPriority(messageId, isPriority = true) {
		try {
			if (global.redisOnline) {
				if (isPriority) {
					await global.redisManager.client.sAdd(this.priorityMessages, messageId);
				} else {
					await global.redisManager.client.sRem(this.priorityMessages, messageId);
				}
			} else {
				if (isPriority) {
					this.ramCache.priority.add(messageId);
				} else {
					this.ramCache.priority.delete(messageId);
				}
			}
			return true;
		} catch (err) {
			console.reportError('Error setting message priority:', err);
			return false;
		}
	}

	async isPriority(messageId) {
		try {
			if (global.redisOnline) {
				return await global.redisManager.client.sIsMember(this.priorityMessages, messageId);
			} else {
				return this.ramCache.priority.has(messageId);
			}
		} catch (err) {
			return false;
		}
	}

	async restoreToDiscordCache() {
		try {
			console.report('Starting message cache loading...');

			let priorityRestored = 0;
			let recentRestored = 0;
			const channelCache = new Map();

			if (global.redisOnline) {
				const priorityIds = await global.redisManager.client.sMembers(this.priorityMessages);
				console.report(`Loading ${priorityIds.length} priority messages first...`);

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
			}

			console.report('Loading recent messages from all channels...');

			for (const [channelId, channel] of global.guild.channels.cache) {
				if (!channel.isTextBased()) continue;

				try {
					const messages = await channel.messages.fetch({ limit: 50 });
					recentRestored += messages.size;

					if (!global.redisOnline) {
						for (const [msgId, msg] of messages) {
							await this.addMessage(msg);
						}
					}
				} catch (err) {
				}
			}

			console.report(`Recent messages loaded: ${recentRestored}`);
			console.report(`Total messages in cache: ${priorityRestored + recentRestored}`);

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

							if (!global.redisOnline) {
								for (const [msgId, msg] of olderMessages) {
									await this.addMessage(msg);
								}
							}
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

