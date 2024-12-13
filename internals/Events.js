'use strict';

const path = require('path');
const { AuditLogEvent, Events, MessageType, Collection } = require('discord.js');
const chokidar = require('chokidar');

const AuditLogEntry = require(global.auditLogEntryPath);
const { set, getSet, getOrNull, compareObjects } = require(global.utilsPath);

const { config: { colors } } = require('extend-console');

let reportEvent;
let reportEventWarn;
let reportEventError;

function setReportEventFunctions() {
	const { defaultLogFormat, defaultFormatArgsForWarn, defaultFormatArgsForError, defaultShouldLog } = require('extend-console');
	function logFormat(logContext, ...args) {
		logContext.functionName = args[0].eventName;
		return defaultLogFormat(logContext, ...args.slice(1));
	}

	function formatArgs(logContext, ...args) {
		let formattedArgs = '';
		for (let i = 1; i < args.length; i += 2) {
			const common = `\n ${colors['FgCyan']}${args[i]}${colors['Reset']}=`;
			if (i + 2 < args.length && args[i + 2] === '->') {
				let arrow = '->';
				let sep = '';
				if ((args[i + 1] && args[i + 1].includes('\n')) || (args[i + 3] && args[i + 3].includes('\n'))) {
					arrow = '\n->\n';
					sep = '\n';
				}
				formattedArgs += `${common}${sep}"${colors['FgYellow']}${args[i + 1]}${colors['Reset']}"${arrow}"${colors['FgYellow']}${args[i + 3]}${colors.Reset}"`;
				i += 2;
			} else {
				formattedArgs += `${common}"${colors['FgYellow']}${args[i + 1]}${colors.Reset}"`;
			}
		}
		return console.fitOnTerm(formattedArgs);
	}

	reportEvent = console.createReport(logFormat, formatArgs, defaultShouldLog);
	reportEventWarn = console.createReportWarn(logFormat, defaultFormatArgsForWarn, defaultShouldLog);
	reportEventError = console.createReportError(logFormat, defaultFormatArgsForError, defaultShouldLog);
}

function compareOldAndNew(oldObj, newObj) {
	const reportEventArgs = [];
	compareObjects(oldObj, newObj).forEach(diff => {
		const oldValue = getOrNull(oldObj, diff); if (typeof oldValue !== 'string') return;
		const newValue = getOrNull(newObj, diff); if (typeof newValue !== 'string') return;
		reportEventArgs.push(diff, getOrNull(oldObj, diff), '->', getOrNull(newObj, diff));
	});
	return reportEventArgs;
}

function categoryFromEvent(event) {
	switch (String(event)) {
		case Events.AutoModerationActionExecution:
		case Events.AutoModerationRuleCreate:
		case Events.AutoModerationRuleDelete:
		case Events.AutoModerationRuleUpdate:
			return 'AutoModeration';

		case Events.ChannelCreate:
		case Events.ChannelDelete:
		case Events.ChannelPinsUpdate:
		case Events.ChannelUpdate:
			return 'Channel';

		case Events.EntitlementCreate:
		case Events.EntitlementDelete:
		case Events.EntitlementUpdate:
			return 'Entitlement';

		case Events.GuildAuditLogEntryCreate:
		case Events.GuildAvailable:
		case Events.GuildBanAdd:
		case Events.GuildBanRemove:
		case Events.GuildCreate:
		case Events.GuildDelete:
		case Events.GuildEmojiCreate:
		case Events.GuildEmojiDelete:
		case Events.GuildEmojiUpdate:
		case Events.GuildIntegrationsUpdate:
		case Events.GuildMemberAdd:
		case Events.GuildMemberAvailable:
		case Events.GuildMemberRemove:
		case Events.GuildMembersChunk:
		case Events.GuildMemberUpdate:
		case Events.GuildRoleCreate:
		case Events.GuildRoleDelete:
		case Events.GuildRoleUpdate:
		case Events.GuildScheduledEventCreate:
		case Events.GuildScheduledEventDelete:
		case Events.GuildScheduledEventUpdate:
		case Events.GuildScheduledEventUserAdd:
		case Events.GuildScheduledEventUserRemove:
		case Events.GuildStickerCreate:
		case Events.GuildStickerDelete:
		case Events.GuildStickerUpdate:
		case Events.GuildUnavailable:
		case Events.GuildUpdate:
			return 'Guild';

		case Events.InviteCreate:
		case Events.InviteDelete:
			return 'Invite';

		case Events.MessageBulkDelete:
		case Events.MessageCreate:
		case Events.MessageDelete:
		case Events.MessagePollVoteAdd:
		case Events.MessagePollVoteRemove:
		case Events.MessageReactionAdd:
		case Events.MessageReactionRemove:
		case Events.MessageReactionRemoveAll:
		case Events.MessageReactionRemoveEmoji:
		case Events.MessageUpdate:
			return 'Message';

		case Events.ApplicationCommandPermissionsUpdate:
		case Events.CacheSweep:
		case Events.Debug:
		case Events.Error:
		case Events.InteractionCreate:
		case Events.Invalidated:
		case Events.PresenceUpdate:
		case Events.Raw:
		case Events.TypingStart:
		case Events.UserUpdate:
		case Events.VoiceServerUpdate:
		case Events.VoiceStateUpdate:
		case Events.Warn:
		case Events.WebhooksUpdate:
			return 'Other';

		case Events.ShardDisconnect:
		case Events.ShardError:
		case Events.ShardReady:
		case Events.ShardReconnecting:
		case Events.ShardResume:
			return 'Shard';

		case Events.StageInstanceCreate:
		case Events.StageInstanceDelete:
		case Events.StageInstanceUpdate:
			return 'Stage';

		case Events.ThreadCreate:
		case Events.ThreadDelete:
		case Events.ThreadListSync:
		case Events.ThreadMembersUpdate:
		case Events.ThreadMemberUpdate:
		case Events.ThreadUpdate:
			return 'Thread';
		
		default:
			return 'Unknown';
	}
}

class EventsManager {
	constructor() {
		this.listeningEvents = new Collection();
	}

	async init() {
		// needed for VoiceStateUpdate
		this.latestAuditLogCount = getOrNull(await global.guild.latestAuditLog(), 'extra.count') || 0;
	}

	register(event, guildId, trigger) {
		const filePath = path.join(global.eventsFolder, categoryFromEvent(event), `${event}.js`);
		try {
			// forget the old callback
			const oldScope = this.listeningEvents.get(event);
			const oldOnEventFunction = oldScope?.onEventFunction;
			if (oldOnEventFunction) {
				global.client.off(event, oldOnEventFunction);
				delete require.cache[require.resolve(filePath)];
			}

			// register the new one
			const { listen: shouldListen, report, callback } = require(filePath);
			if (!shouldListen) {
				console.reportWarn(`The event ${event} is not listening`);
				return;
			}
			if (!callback) {
				console.reportWarn(`The event at ${filePath} is missing a required "callback" function`);
				return;
			}
			if (typeof callback !== 'function') {
				console.reportWarn(`The event at ${filePath} has a "callback" attribute of type ${typeof callback}, expected function`);
				return;
			}
			const scope = {};
			async function onEventFunction(...args) {
				try {
					if (global.guild.id !== guildId(...args)) return;
					scope
						.set('eventName', String(event))
						.set('args', [])
						.set('latestAuditLog', await global.guild.latestAuditLog());
					await scope.trigger(...args);
					scope.callback(...args, ...(scope.args || []));
				} catch (err) {
					reportEventError(scope.eventName, err);
				}
			}
			function listen() {
				global.client.on(scope.event, onEventFunction);
				console.report('listening to event', event);
				this.listeningEvents.set(event, scope);
			}
			set(scope, 'onEventFunction', onEventFunction);
			set(scope, 'filePath', filePath);
			set(scope, 'event', event);
			set(scope, 'report', report ? (...args) => reportEvent(scope, ...args) : (...args) => {});
			set(scope, 'listen', listen.bind(this));
			set(scope, 'set', getSet(true, true).bind(scope));
			set(scope, 'trigger', trigger.bind(scope));
			set(scope, 'callback', callback.bind(scope));
			return scope;
		} catch (err) {
			console.reportError(`Failed to register event at ${filePath}:`, err);
		}
	}

	dispatch(event) {
		const latestAuditLogCount = this.latestAuditLogCount;
		switch (event) {
		
		// TODO: ApplicationCommandPermissionsUpdate
		// TODO: AutoModerationActionExecution
		// TODO: AutoModerationRuleCreate
		// TODO: AutoModerationRuleDelete
		// TODO: AutoModerationRuleUpdate
		// TODO: CacheSweep
	
		case Events.ChannelCreate:
			return this.register(event, (channel) => channel.guild.id, async function (channel) {
				const executor = this.latestAuditLog.executor;

				// global.eventsDatabase.addEntry(this.event, {
				//	 channelId: channel.id,
				//	 name: channel.name,
				//	 permissions: channel.permissionOverwrites.cache,
				//	 datetime: Date.now(),
				//	 executorId: executor.id,
				// });

				this.report('channel.name', channel.name, 'executor.tag', executor.tag, 'channel.type', global.guild.channelTypeStr(channel.type));
			})?.listen();

		case Events.ChannelDelete:
			return this.register(event, (channel) => channel.guild.id, async function (channel) {
				const executor = this.latestAuditLog.executor;

				// global.eventsDatabase.addEntry(this.event, {
				//	 channelId: channel.id,
				//	 name: channel.name,
				//	 permissions: channel.permissionOverwrites.cache,
				//	 datetime: Date.now(),
				//	 isDelete: true,
				//	 executorId: executor.id,
				// });

				global.messagesDatabase.bulkDelete(channel.id);

				this.report('channel.name', channel.name, 'executor.tag', executor.tag, 'channel.type', global.guild.channelTypeStr(channel.type));
			})?.listen();

		case Events.ChannelPinsUpdate:
			return this.register(event, (channel) => channel.guild.id, async function (channel, date) {
				const executor = this.latestAuditLog.executor;
				const messageId = this.latestAuditLog.extra.messageId;
				if (this.latestAuditLog.action === AuditLogEntry.MessagePin) {
					this.eventName += '.pin';
				} else if (this.latestAuditLog.action === AuditLogEntry.MessageUnpin) {
					this.eventName += '.unpin';
				} else {
					reportEventWarn(this.eventName, 'impossible case reached', this.latestAuditLog);
				}
				// const r = await global.messagesDatabase.get(messageId);
				// console.log(r);
				const pinnedMessage = await channel.messages.fetch(messageId);
				this.args = [channel, date, pinnedMessage];
				this.report('channel.name', channel.name, 'executor.tag', executor.globalName, 'author.tag', pinnedMessage.author.tag, 'pinnedMessage.content', pinnedMessage.content);
			})?.listen();

		case Events.ChannelUpdate:
			return this.register(event, (oldChannel, newChannel) => newChannel.guild.id, async function (oldChannel, newChannel) {
				const executor = this.latestAuditLog.executor;

				// global.eventsDatabase.addEntry(this.event, {
				//	 channelId: newChannel.id,
				//	 oldName: oldChannel.name,
				//	 newName: newChannel.name,
				//	 oldPermissions: oldChannel.permissionOverwrites.cache,
				//	 newPermissions: newChannel.permissionOverwrites.cache,
				//	 datetime: Date.now(),
				//	 executorId: executor.id,
				// });

				this.report('channel.name', oldChannel.name, '->', newChannel.name, 'executor.tag', executor.tag, 'channel.type', global.guild.channelTypeStr(newChannel.type));
			})?.listen();

		// DONE: ClientReady
		// TODO: Debug
		// TODO: EntitlementCreate
		// TODO: EntitlementDelete
		// TODO: EntitlementUpdate
		// TODO: Error
		// TODO: GuildAuditLogEntryCreate
		// TODO: GuildAvailable

		case Events.GuildBanAdd:
			return this.register(event, (ban) => ban.guild.id, async function (ban) {
				const user = ban.user;
				const executor = this.latestAuditLog.executor;

				// global.eventsDatabase.addEntry(this.event, {
				//	 userid: user.id,
				//	 reason: ban.reason,
				//	 datetime: Date.now(),
				//	 executorId: executor.id,
				// });

				this.report('user.tag', user.tag, 'executor.tag', executor.tag, 'reason', ban.reason);
			})?.listen();

		case Events.GuildBanRemove:
			return this.register(event, (ban) => ban.guild.id, async function (ban) {
				const user = ban.user;
				const executor = this.latestAuditLog.executor;

				// global.eventsDatabase.addEntry(this.event, {
				//	 userid: user.id,
				//	 datetime: Date.now(),
				//	 isDelete: true,
				//	 executorId: executor.id,
				// });

				this.report('user.tag', user.tag, 'executor.tag', executor.tag);
			})?.listen();

		// TODO: GuildCreate
		// TODO: GuildDelete

		case Events.GuildEmojiUpdate:
			return this.register(event, (oldEmoji, newEmoji) => newEmoji.guild.id, async function (oldEmoji, newEmoji) {
				const executor = this.latestAuditLog.executor;

				// global.eventsDatabase.addEntry(this.event, {
				//	 emojiId: newEmoji.id,
				//	 emojiPath: newEmoji.url,
				//	 datetime: Date.now(),
				//	 executorId: executor.id,
				// });

				this.report('executor.tag', executor.tag, 'emoji.name', oldEmoji.name, '->', newEmoji.name, 'emoji.url', oldEmoji.url, '->', newEmoji.url);
			})?.listen();

		case Events.GuildEmojiDelete:
			return this.register(event, (emoji) => emoji.guild.id, async function (emoji) {
				const executor = this.latestAuditLog.executor;

				// TODO: add 'addEmojiDelete' to DB
				// global.eventsDatabase.addEntry(this.event, {
				//	 emojiId: emoji.id,
				//	 datetime: Date.now(),
				//	 isDelete: true,
				//	 executorId: executor.id,
				// });

				this.report('executor.tag', executor.tag, 'emoji.name', emoji.name, 'emoji.url', emoji.url);
			})?.listen();

		case Events.GuildEmojiUpdate: 
			return this.register(event, (oldEmoji, newEmoji) => newEmoji.guild.id, async function (oldEmoji, newEmoji) {
				const executor = this.latestAuditLog.executor;

				// global.eventsDatabase.addEntry(this.event, {
				//	 emojiId: newEmoji.id,
				//	 oldEmojiPath: oldEmoji.url,
				//	 newEmojiPath: newEmoji.url,
				//	 datetime: Date.now(),
				//	 executorId: executor.id,
				// });

				this.report('executor.tag', executor.tag, 'emoji.name', oldEmoji.name, '->', newEmoji.name, 'emoji.url', oldEmoji.url, '->', newEmoji.url);
			})?.listen();
		
		// TODO: GuildIntegrationsUpdate

		case Events.GuildMemberAdd: 
			return this.register(event, (member) => member.guild.id, async function (member) {
				const user = member.user;

				// global.eventsDatabase.addEntry(this.event, {
				//	 userid: user.id,
				//	 joinedAt: Date.now(),
				//	 nickname: member.nickname || '',
				// });

				this.report('user.tag', user.tag);
			})?.listen();
		
		case Events.GuildMemberAvailable: 
			return this.register(event, (oldMember, newMember) => newMember.guild.id, async function (oldMember, newMember) {
				// TODO

				this.report('member.user.tag', member.user.tag);
			})?.listen();
		
		case Events.GuildMemberRemove: 
			return this.register(event, (member) => member.guild.id, async function (member) {
				const user = member.user;

				if (this.latestAuditLog?.action === AuditLogEvent.GuildBanAdd && this.latestAuditLog?.target.id === user.id)
					return;

				// TODO: rename leftedAt to leftAt in DB
				// global.eventsDatabase.addEntry(this.event, {
				//	 userid: user.id,
				//	 leftAt: Date.now(),
				// });

				this.report('user.tag', user.tag);
			})?.listen();
		
		// TODO: GuildMembersChunk

		case Events.GuildMemberUpdate: 
			return this.register(event, (oldMember, newMember) => newMember.guild.id, async function (oldMember, newMember) {
				this.report('user.tag', oldMember.user.tag, '->', newMember.user.tag);
			})?.listen();
		
		case Events.GuildRoleCreate: 
			return this.register(event, (role) => role.guild.id, async function (role) {
				const executor = this.latestAuditLog.executor;

				// global.eventsDatabase.addEntry(this.event, {
				//	 roleId: role.id,
				//	 name: role.name,
				//	 color: role.hexColor,
				//	 permissions: role.permissions,
				//	 datetime: Date.now(),
				//	 executorId: executor.id,
				// });

				this.report('executor.tag', executor.tag, 'role.name', role.name);
			})?.listen();
		
		case Events.GuildRoleDelete: 
			return this.register(event, (role) => role.guild.id, async function (role) {
				const executor = this.latestAuditLog.executor;

				// global.eventsDatabase.addEntry(this.event, {
				//	 roleId: role.id,
				//	 name: role.name,
				//	 datetime: Date.now(),
				//	 isDelete: true,
				//	 executorId: executor.id,
				// });

				this.report('executor.tag', executor.tag, 'role.name', role.name);
			})?.listen();
		
		case Events.GuildRoleUpdate: 
			return this.register(event, (oldRole, newRole) => newRole.guild.id, async function (oldRole, newRole) {
				const executor = this.latestAuditLog.executor;

				// global.eventsDatabase.addEntry(this.event, {
				//	 roleId: newRole.id,
				//	 name: newRole.name,
				//	 datetime: Date.now(),
				//	 executorId: executor.id,
				// });

				this.report('executor.tag', executor.tag, 'role.name', oldRole.name, '->', newRole.name, 'role.color', oldRole.hexColor, '->', newRole.hexColor);
			})?.listen();
		
		// TODO: GuildScheduledEventCreate
		// TODO: GuildScheduledEventDelete
		// TODO: GuildScheduledEventUpdate
		// TODO: GuildScheduledEventUserAdd
		// TODO: GuildScheduledEventUserRemove

		case Events.GuildStickerCreate: 
			return this.register(event, (oldSticker, newSticker) => newSticker.guild.id, async function (oldSticker, newSticker) {
				const executor = this.latestAuditLog.executor;

				// global.eventsDatabase.addEntry(this.event, {
				//	 emojiId: sticker.id,
				//	 emojiPath: sticker.url,
				//	 datetime: Date.now(),
				//	 executorId: executor.id,
				// });

				this.report('executor.tag', executor.tag, 'sticker.name', sticker.name);
			})?.listen();
		
		case Events.GuildStickerDelete: 
			return this.register(event, (sticker) => sticker.guild.id, async function (sticker) {
				const executor = this.latestAuditLog.executor;

				// TODO: isDelete?
				// global.eventsDatabase.addEntry(this.event, {
				//	 emojiId: sticker.id,
				//	 datetime: Date.now(),
				//	 // isDelete: true,
				//	 executorId: executor.id,
				// });

				this.report('executor.tag', executor.tag, 'sticker.name', sticker.name);
			})?.listen();
		
		case Events.GuildStickerUpdate: 
			return this.register(event, (oldSticker, newSticker) => newSticker.guild.id, async function (oldSticker, newSticker) {
				const executor = this.latestAuditLog.executor;

				// TODO: isDelete? add addStickerUpdate to the DB
				// global.eventsDatabase.addEntry(this.event, {
				//	 emojiId: sticker.id,
				//	 datetime: Date.now(),
				//	 // isDelete: true,
				//	 executorId: executor.id,
				// });

				this.report('executor.tag', executor.tag, 'sticker.name', oldSticker.name, '->', newSticker.name);
			})?.listen();
		
		// TODO: GuildUnavailable
		// TODO: GuildUpdate
		
		case Events.InteractionCreate: 
			return this.register(event, (interaction) => interaction.guildId, async function (interaction) {
				const executor = interaction.user;

				// global.eventsDatabase.addEntry(this.event, {
				//	 type: interaction.type,
				//	 datetime: Date.now(),
				//	 commandName: interaction.commandName,
				//	 executorId: executor.id,
				//	 channelid: interaction.channelId,
				// });

				if (interaction.isAutocomplete()) {
					this.eventName += '.autocomplete';
					this.reportDefault(interaction);
				} else if (interaction.isButton()) {
					this.eventName += '.button';
					this.reportDefault(interaction);
				} else if (interaction.isMessageComponent()) {
					this.eventName += '.messageComponent';
					this.reportDefault(interaction);
				} else if (interaction.isModalSubmit()) {
					this.eventName += '.modalSubmit';
					this.reportDefault(interaction);
				} else if (interaction.isChatInputCommand()) {
					this.reportChatInputCommand(interaction);
				} else if (interaction.isUserContextMenuCommand()) {
					this.eventName += '.userContextMenuCommand';
					this.reportDefault(interaction);
				} else if (interaction.isContextMenuCommand()) {
					this.eventName += '.contextMenuCommand';
					this.reportDefault(interaction);
				} else if (interaction.isMessageContextMenuCommand()) {
					this.eventName += '.messageContextMenuCommand';
					this.reportDefault(interaction);
				} else if (interaction.isStringSelectMenu()) {
					this.eventName += '.stringSelectMenu';
					this.reportDefault(interaction);
				} else if (interaction.isUserSelectMenu()) {
					this.eventName += '.userSelectMenu';
					this.reportDefault(interaction);
				} else if (interaction.isRoleSelectMenu()) {
					this.eventName += '.roleSelectMenu';
					this.reportDefault(interaction);
				} else if (interaction.isMentionableSelectMenu()) {
					this.eventName += '.mentionableSelectMenu';
					this.reportDefault(interaction);
				} else if (interaction.isChannelSelectMenu()) {
					this.eventName += '.channelSelectMenu';
					this.reportDefault(interaction);
				} else {
					reportEventWarn(this.eventName, 'executor.tag', interaction.user.tag, 'client.tag', interaction.client.user.tag, 'channel.name', interaction.channel.name, 'unknown interaction of type', interaction.type);
				}
			}
			)
				?.set('reportDefault', function (interaction) {
					try {
						this.report('executor.tag', interaction.user.tag, 'client.tag', interaction.client.user.tag, 'channel.name', interaction.channel.name);
					} catch (err) {
						reportEventError(this.eventName, err);
					}
				})
				.set('reportChatInputCommand', function (interaction) {
					try {
						this.eventName += '.chatInputCommand';
						let cmd = `/${interaction.commandName}`;
						for (const option of interaction.options._hoistedOptions) {
							switch (option.type) {
								case 3:
								case 5:
									cmd += ` ${option.name}: ${option.value}`;
									break;
								case 6:
									cmd += ` user: @${option.member.displayName}`;
									break;
								default:
									reportEventWarn(this.eventName, 'executor.tag', interaction.user.tag, 'client.tag', interaction.client.user.tag, 'channel.name', interaction.channel.name, 'command', cmd, 'unsupported option type', option.type);
									break;
							}
						}
						this.report('executor.tag', interaction.user.tag, 'client.tag', interaction.client.user.tag, 'channel.name', interaction.channel.name, 'command', cmd);
					} catch (err) {
						reportEventError(this.eventName, err);
					}
				}).listen();

		// TODO: Invalidated

		case Events.InviteCreate: 
			return this.register(event, (invite) => invite.guild.id, async function (invite) {
				const executor =
					invite.inviter || this.latestAuditLog.executor;

				// TODO: remove userid from DB
				// global.eventsDatabase.addEntry(this.event, {
				//	 // userid: user.id,
				//	 code: invite.code,
				//	 channelid: invite.channel.id,
				//	 maxUses: invite.maxUses,
				//	 expiresAt: invite.expiresTimestamp,
				//	 executorId: executor.id,
				//	 datetime: Date.now(),
				// });

				this.report('executor.tag', executor.tag, 'url', invite.url);
			})?.listen();
		
		case Events.InviteDelete: 
			return this.register(event, (invite) => invite.guild.id, async function (invite) {
				const executor =
					invite.inviter || this.latestAuditLog.executor;

				// global.eventsDatabase.addEntry(this.event, {
				//	 code: invite.code,
				//	 channelid: invite.channel.id,
				//	 executorId: executor.id,
				//	 datetime: Date.now(),
				// });

				this.report('executor.tag', executor.tag, 'url', invite.url);
			})?.listen();
		
		case Events.MessageBulkDelete: 
			return this.register(event, (messages, channel) => channel.guild.id, async function (messages, channel) {
				const executor = this.latestAuditLog.executor;

				// global.eventsDatabase.addEntry(this.event, {
				//	 channelId: channel.id,
				//	 deletedMessages: messages.size,
				//	 datetime: Date.now(),
				//	 executorId: executor.id,
				// });

				this.report('channel.name', channel.name, 'executor.tag', executor.tag, 'messages.size', messages.size);
			})?.listen();
		
		case Events.MessageCreate: 
			return this.register(event, (message) => message.guild.id, async function (message) {
				const executor = message.author;
				const channel = message.channel;
				const content = message.content;

				if (message.type === MessageType.ChannelPinnedMessage) return;

				// TODO: rename userId to executorId in DB
				// global.eventsDatabase.addEntry(this.event, {
				//	 id: message.id,
				//	 userId: executor.id,
				//	 channelId: channel.id,
				//	 content: content,
				//	 datetime: Date.now(),
				//	 attachments: filenames ? JSON.stringify(filenames) : null,
				//	 isDelete: 0,
				//	 isReply: message.reference ? 1 : 0,
				//	 replyToMessageId: message.reference ? message.reference.messageId : null,
				// });

				global.messagesDatabase.set(message);

				this.report('channel.name', channel.name, 'executor.tag', executor.tag, 'content', content);
			})?.listen();
		
		case Events.MessageDelete: 
			return this.register(event, (message) => message.guild.id, async function (message) {
				const executor = this.latestAuditLog.executor;

				// global.eventsDatabase.addEntry(this.event, {
				//	 messageId: message.id,
				//	 datetime: Date.now(),
				//	 executorId: executor.id,
				// });

				this.report('channel.name', message.channel.name, 'executor.tag', executor.tag, 'content', message.content);
			})?.listen();

		// TODO: MessagePollVoteAdd

		// TODO: MessagePollVoteRemove

		// TODO: ALL REACTIONS ARE NOT WORKING BRUH
		
		case Events.MessageReactionAdd: 
			return this.register(event, (reaction, executor, details) => reaction.message.guild.id, async function (reaction, executor, details) {
				console.log('MessageReactionAdd');
				// const emoji = reaction.emoji;
				// const message = reaction.message;
				// const user = message.author;

				// global.eventsDatabase.addEntry(this.event, {
				//	 reactionId: emoji.id || 0,
				//	 messageId: message.id,
				//	 userId: user.id,
				//	 datetime: Date.now(),
				//	 name: emoji.name,
				// });

				// this.report('executor.tag', executor.tag, 'emoji.name', emoji.name, 'message.author.tag', user.tag);
			})?.listen();
		
		case Events.MessageReactionRemove: 
			return this.register(event, (reaction, executor, details) => reaction.message.guild.id, async function (reaction, executor, details) {
				console.log('MessageReactionRemove');
				// const emoji = reaction.emoji;
				// const message = reaction.message;
				// const user = message.author;

				// global.eventsDatabase.addEntry(this.event, {
				//	 reactionId: emoji.id || 0,
				//	 messageId: message.id,
				//	 userId: user.id,
				//	 datetime: Date.now(),
				//	 name: emoji.name,
				// });

				// this.report('executor.tag', executor.tag, 'emoji.name', emoji.name, 'message.author.tag', user.tag);
			})?.listen();
		
		case Events.MessageReactionRemoveEmoji: 
			return this.register(event, (reaction) => reaction.message.guild.id, async function (reaction) {
				console.log('MessageReactionRemoveEmoji');
			})?.listen();
		
		case Events.MessageUpdate: 
			return this.register(event, (oldMessage, newMessage) => newMessage.guild.id, async function (oldMessage, newMessage) {
				const author = oldMessage?.author || newMessage?.author;

				// global.eventsDatabase.addEntry(this.event, {
				//	 userId: user.id,
				//	 messageId: newMessage.id,
				//	 newContent: newMessage.content,
				//	 oldContent: oldMessage.content,
				//	 datetime: Date.now(),
				// });
				// global.messagesDatabase.update(newMessage);
				// console.log(oldMessage.content, newMessage.content);

				const reportEventArgs = compareOldAndNew(oldMessage, newMessage);

				if (reportEventArgs.length === 0 || (reportEventArgs.length === 4 && reportEventArgs[0] === 'pinned')) return;

				this.report('channel.name', newMessage.channel.name, 'author.tag', author.tag, ...reportEventArgs);
			})?.listen();

		// TODO: PresenceUpdate
		// TODO: Raw
		// TODO: ShardDisconnect
		// TODO: ShardError
		// TODO: ShardReady
		// TODO: ShardReconnecting
		// TODO: ShardResume
		// TODO: StageInstanceCreate
		// TODO: StageInstanceDelete
		// TODO: StageInstanceUpdate

		case Events.ThreadCreate: 
			return this.register(event, (thread, newlyCreated) => thread.guild.id, async function (thread, newlyCreated) {
				const executor = this.latestAuditLog.executor;

				// global.eventsDatabase.addEntry(this.event, {
				//	 channelId: thread.id,
				//	 name: thread.name,
				//	 permissions: thread.permissionOverwrites.cache,
				//	 datetime: Date.now(),
				//	 executorId: executor.id,
				// });

				this.report('executor.tag', executor.tag, 'thread.name', thread.name);
			})?.listen();
		
		case Events.ThreadDelete: 
			return this.register(event, (thread) => thread.guild.id, async function (thread) {
				const executor = this.latestAuditLog.executor;

				// global.eventsDatabase.addEntry(this.event, {
				//	 channelId: thread.id,
				//	 name: thread.name,
				//	 permissions: thread.permissionOverwrites.cache,
				//	 datetime: Date.now(),
				//	 executorId: executor.id,
				// });

				this.report('executor.tag', executor.tag, 'thread.name', thread.name);
			})?.listen();

		// TODO: ThreadListSync
		// TODO: ThreadMembersUpdate
		// TODO: ThreadMemberUpdate

		case Events.ThreadUpdate: 
			return this.register(event, (oldThread, newThread) => newThread.guild.id, async function (oldThread, newThread) {
				executor = this.latestAuditLog.executor;

				// global.eventsDatabase.addEntry(this.event, { channelId: newThread.id, oldName: oldThread.name, newName: newThread.name, datetime: Date.now(), executorId: executor.id, });

				this.report('executor.tag', executor.tag, 'thread.name', oldThread.name, '->', newThread.name
				);
			})?.listen();

		// TODO: TypingStart
		// TODO: UserUpdate
		// TODO: VoiceServerUpdate

		case Events.VoiceStateUpdate: 
			return this.register(event, (oldState, newState) => newState.guild.id, async function (oldState, newState) {
				this.oldState = oldState;
				this.newState = newState;
				if (!oldState.channelId && !newState.channelId) {
					reportEventWarn(this.eventName, 'impossible case reached: old and new states are null');
					return;
				}

				let user, channel, executor;
				let updates = [];

				this.now = Date.now();
				const voiceStateUpdateObject = function (user, executor, eventType) {
					return {
						userId: user.id,
						oldChannelId: oldState?.channelId,
						newChannelId: newState?.channelId,
						datetime: now,
						executorId: executor.id,
						oldServerDeaf: oldState?.serverDeaf,
						newServerDeaf: newState?.serverDeaf,
						oldServerMute: oldState?.serverMute,
						newServerMute: newState?.serverMute,
						oldClientMute: oldState?.selfMute,
						newClientMute: newState?.selfMute,
						oldClientDeaf: oldState?.selfDeaf,
						newClientDeaf: newState?.selfMute,
						oldStream: oldState?.streaming,
						newStream: newState?.streaming,
						oldCam: oldState?.selfVideo,
						newCam: newState?.selfVideo,
						eventType: eventType,
					};
				};

				if (oldState.channelId) {
					user = oldState.member.user;
					channel = oldState.channel;

					if (newState.channelId) {
						if (oldState.channelId !== newState.channelId) {
							this.eventName += '.move';

							executor = await this.getExecutor(AuditLogEvent.MemberMove);
							// global.eventsDatabase.addEntry(this.event, voiceStateUpdateObject(user, executor || user, 2));
						} else {
							this.eventName += '.update';

							if (oldState.serverDeaf !== newState.serverDeaf) {
								executor = await this.getExecutor(AuditLogEvent.MemberUpdate);
								updates.push('user.serverDeaf', oldState.serverDeaf, '->', newState.serverDeaf);
							}
							if (oldState.serverMute !== newState.serverMute) {
								executor = await this.getExecutor(AuditLogEvent.MemberUpdate);
								updates.push('user.serverMute', oldState.serverMute, '->', newState.serverMute);
							}
							if (oldState.selfMute !== newState.selfMute) updates.push('user.selfMute', oldState.selfMute, '->', newState.selfMute);
							if (oldState.selfDeaf !== newState.selfDeaf) updates.push('user.selfDeaf', oldState.selfDeaf, '->', newState.selfDeaf);
							if (oldState.streaming !== newState.streaming) updates.push('user.streaming', oldState.streaming, '->', newState.streaming);
							if (oldState.selfVideo !== newState.selfVideo) updates.push('user.selfVideo', oldState.selfVideo, '->', newState.selfVideo);

							if (updates.length === 0) {
								reportEventWarn(this.eventName, 'impossible case reached: old and new states are equal with no update');
								return;
							}

							// global.eventsDatabase.addEntry(this.event, voiceStateUpdateObject(user, executor || user, 4));
						}
					} else {
						this.eventName += '.leave';

						executor = await this.getExecutor(AuditLogEvent.MemberDisconnect);
						// global.eventsDatabase.addEntry(this.event, voiceStateUpdateObject(user, executor || user, 3));
					}
				} else {
					this.eventName += '.join';

					user = newState.member.user;
					channel = newState.channel;

					executor = await this.getExecutor(AuditLogEvent.MemberMove);
					// global.eventsDatabase.addEntry(this.event, voiceStateUpdateObject(user, executor || user, 1));
				}

				const args = ['user.tag', user.tag, 'channel.name', channel.name,];
				if (executor) args.push('executor.tag', executor.tag);
				this.report('user.tag', user.tag, 'channel.name', channel.name);
			})
				?.set('count', latestAuditLogCount)
				.set('now', undefined)
				.set('getExecutor', async function getExecutor(auditLogEventType) {
					const latestAuditLog = this.latestAuditLog;
					if (!latestAuditLog) return null;
					const dt = this.now - latestAuditLog.createdTimestamp;
					if (latestAuditLog.action === auditLogEventType && (dt < 1000 || latestAuditLog.extra.count - this.count === 1)) {
						this.count = latestAuditLog.extra.count;
						return latestAuditLog.executor;
					}
					return null;
				}).listen();

		// TODO: Warn
		// TODO: WebhooksUpdate
		}
	}

	dispatchAll() {
		Object.values(Events).forEach(event => this.dispatch(event));
	}

	reload() {
		this.listeningEvents.clear();
		this.dispatchAll();
	}

	onFileChange(filePath) {
		try {
			const event = path.basename(filePath, '.js');
			this.dispatch(event);
		} catch (err) {
			console.reportError(`Failed to reload event at ${filePath}:`, err);
		}
	}

	watch() {
		const watcher = chokidar.watch(this.listeningEvents.map(scope => scope.filePath), {
			persistent: true,
			ignored: /(^|[\/\\])\../,
			ignoreInitial: true,
		});

		watcher.on('change', this.onFileChange.bind(this));
		watcher.on('add', this.onFileChange.bind(this))

		console.report(`Watching events...`);;
	}
}

module.exports = {
	EventsManager,
	setReportEventFunctions
}