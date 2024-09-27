'use strict';
const path = require('path');
const { AuditLogEvent, Events, MessageType } = require('discord.js');
const AuditLogEntry = require(global.auditLogEntryPath);

const { config: { colors }, defaultLogFormat, defaultFormatArgsForWarn, defaultFormatArgsForError, defaultShouldLog } = require('extend-console');
const { getOrNull, compareObjects } = require(global.utilsPath);

function logFormat(logContext, ...args) {
    // replace functionName with eventName
    logContext.functionName = args[0];
    return defaultLogFormat(logContext, ...args.slice(1));
}

function formatArgs(logContext, ...args) {
    let i = 1;
    let formattedArgs = '';
    const mustEndWith = `${colors.Reset}"`;
    while (i < args.length) {
        const common = `\n ${colors['FgCyan']}${args[i]}${colors['Reset']}=`;
        if (i + 2 < args.length && args[i + 2] === '->') {
            let arrow = '->';
            let sep = '';
            if ((args[i + 1] && args[i + 1].includes('\n')) || (args[i + 3] && args[i + 3].includes('\n'))) {
                arrow = '\n->\n';
                sep = '\n';
            }
            formattedArgs += `${common}${sep}"${colors['FgYellow']}${args[i + 1]}${colors['Reset']}"${arrow}"${colors['FgYellow']}${args[i + 3]}${mustEndWith}`;
            i += 2;
        } else {
            formattedArgs += `${common}"${colors['FgYellow']}${args[i + 1]}${mustEndWith}`;
        }
        i += 2;
    }
    return console.fitOnTerm(formattedArgs);
}

function shouldLog(logContext, ...args) {
    return defaultShouldLog(logContext, ...args) && global.reportEvents && global.configReportEvents[args[0].split('.')[0]];
}

const reportEvent = console.createReport(logFormat, formatArgs, shouldLog);
const reportEventWarn = console.createReportWarn(logFormat, defaultFormatArgsForWarn, shouldLog);
const reportEventError = console.createReportError(logFormat, defaultFormatArgsForError, shouldLog);

function compareOldAndNew(oldObj, newObj) {
    const reportEventArgs = [];
    compareObjects(oldObj, newObj).forEach(diff => {
        const oldValue = getOrNull(oldObj, diff); if (typeof oldValue !== 'string') return;
        const newValue = getOrNull(newObj, diff); if (typeof newValue !== 'string') return;
        reportEventArgs.push(diff, getOrNull(oldObj, diff), '->', getOrNull(newObj, diff));
    });
    return reportEventArgs;
}

function shouldListen(event) {
    return global.listenEvents && global.configListenEvents[event];
}

function eventToPath(event) {
    let category;
    switch (String(event)) {
        case Events.AutoModerationActionExecution:
        case Events.AutoModerationRuleCreate:
        case Events.AutoModerationRuleDelete:
        case Events.AutoModerationRuleUpdate:
            category = 'AutoModeration';
            break;

        case Events.ChannelCreate:
        case Events.ChannelDelete:
        case Events.ChannelPinsUpdate:
        case Events.ChannelUpdate:
            category = 'Channel';
            break;

        case Events.EntitlementCreate:
        case Events.EntitlementDelete:
        case Events.EntitlementUpdate:
            category = 'Entitlement';
            break;

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
            category = 'Guild';
            break;

        case Events.InviteCreate:
        case Events.InviteDelete:
            category = 'Invite';
            break;

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
            category = 'Message';
            break;

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
            category = 'Other';
            break;

        case Events.ShardDisconnect:
        case Events.ShardError:
        case Events.ShardReady:
        case Events.ShardReconnecting:
        case Events.ShardResume:
            category = 'Shard';
            break;

        case Events.StageInstanceCreate:
        case Events.StageInstanceDelete:
        case Events.StageInstanceUpdate:
            category = 'Stage';
            break;

        case Events.ThreadCreate:
        case Events.ThreadDelete:
        case Events.ThreadListSync:
        case Events.ThreadMembersUpdate:
        case Events.ThreadMemberUpdate:
        case Events.ThreadUpdate:
            category = 'Thread';
            break;
        default:
            category = 'Unknown';
            break;
    }

    return path.join(global.eventsFolder, category, `${event}.js`);
}

function registerEvent(event, guildId, trigger) {
    const eventScope = {};
    const set = function (o, k, v, w = false, e = true) {
        Object.defineProperty(o, k, { value: v, writable: w, enumerable: e });
    };
    const eventScopeSet = function (key, value) {
        Object.defineProperty(eventScope, key, {
            value: value,
            writable: true,
            enumerable: true,
        });
        return eventScope;
    };
    const listen = function () {
        if (!shouldListen(eventScope.event)) return;
        global.client.on(eventScope.event, async function (...args) {
            eventScope.eventName = String(eventScope.event);
            try {
                if (global.guild.id !== eventScope.guildId(...args)) return;
                eventScope.latestAuditLog = await global.guild.latestAuditLog();
                await eventScope.trigger(...args);
                const module = require(eventToPath(eventScope.event));
                module.event = eventScope.event;
                module.eventName = eventScope.eventName;
                module.latestAuditLog = eventScope.latestAuditLog;
                module.callback(...args, ...(eventScope.args || []));
            } catch (err) {
                reportEventError(eventScope.eventName, err);
            }
        });
        console.report('listening to event', eventScope.event);
    };
    set(eventScope, 'event', event);
    set(eventScope, 'eventName', undefined, true);
    set(eventScope, 'set', eventScopeSet.bind(eventScope));
    set(eventScope, 'guildId', guildId.bind(eventScope));
    set(eventScope, 'trigger', trigger.bind(eventScope));
    set(eventScope, 'listen', listen.bind(eventScope));
    set(eventScope, 'args', undefined, true);
    return eventScope;
}

// TODO: ApplicationCommandPermissionsUpdate

// TODO: AutoModerationActionExecution

// TODO: AutoModerationRuleCreate

// TODO: AutoModerationRuleDelete

// TODO: AutoModerationRuleUpdate

// TODO: CacheSweep

console.report('Dispatching events...');

registerEvent(Events.ChannelCreate, (channel) => channel.guild.id, async function (channel) {
    const executor = this.latestAuditLog.executor;

    // global.eventsDatabase.addEntry(this.event, {
    //     channelId: channel.id,
    //     name: channel.name,
    //     permissions: channel.permissionOverwrites.cache,
    //     datetime: Date.now(),
    //     executorId: executor.id,
    // });

    reportEvent(this.eventName, 'channel.name', channel.name, 'executor.tag', executor.tag, 'channel.type', global.guild.channelTypeStr(channel.type));
}).listen();

registerEvent(Events.ChannelDelete, (channel) => channel.guild.id, async function (channel) {
    const executor = this.latestAuditLog.executor;

    // global.eventsDatabase.addEntry(this.event, {
    //     channelId: channel.id,
    //     name: channel.name,
    //     permissions: channel.permissionOverwrites.cache,
    //     datetime: Date.now(),
    //     isDelete: true,
    //     executorId: executor.id,
    // });

    reportEvent(this.eventName, 'channel.name', channel.name, 'executor.tag', executor.tag, 'channel.type', global.guild.channelTypeStr(channel.type));
}).listen();

registerEvent(Events.ChannelPinsUpdate, (channel) => channel.guild.id, async function (channel, date) {
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
    reportEvent(this.eventName, 'channel.name', channel.name, 'executor.tag', executor.globalName, 'author.tag', pinnedMessage.author.tag, 'pinnedMessage.content', pinnedMessage.content);
}).listen();

registerEvent(Events.ChannelUpdate, (oldChannel, newChannel) => newChannel.guild.id, async function (oldChannel, newChannel) {
    const executor = this.latestAuditLog.executor;

    // global.eventsDatabase.addEntry(this.event, {
    //     channelId: newChannel.id,
    //     oldName: oldChannel.name,
    //     newName: newChannel.name,
    //     oldPermissions: oldChannel.permissionOverwrites.cache,
    //     newPermissions: newChannel.permissionOverwrites.cache,
    //     datetime: Date.now(),
    //     executorId: executor.id,
    // });

    reportEvent(this.eventName, 'channel.name', oldChannel.name, '->', newChannel.name, 'executor.tag', executor.tag, 'channel.type', global.guild.channelTypeStr(newChannel.type));
}).listen();

// DONE: ClientReady

// TODO: Debug

// TODO: EntitlementCreate

// TODO: EntitlementDelete

// TODO: EntitlementUpdate

// TODO: Error

// TODO: GuildAuditLogEntryCreate

// TODO: GuildAvailable

registerEvent(Events.GuildBanAdd, (ban) => ban.guild.id, async function (ban) {
    const user = ban.user;
    const executor = this.latestAuditLog.executor;

    // global.eventsDatabase.addEntry(this.event, {
    //     userid: user.id,
    //     reason: ban.reason,
    //     datetime: Date.now(),
    //     executorId: executor.id,
    // });

    reportEvent(this.eventName, 'user.tag', user.tag, 'executor.tag', executor.tag, 'reason', ban.reason);
}).listen();

registerEvent(Events.GuildBanRemove, (ban) => ban.guild.id, async function (ban) {
    const user = ban.user;
    const executor = this.latestAuditLog.executor;

    // global.eventsDatabase.addEntry(this.event, {
    //     userid: user.id,
    //     datetime: Date.now(),
    //     isDelete: true,
    //     executorId: executor.id,
    // });

    reportEvent(this.eventName, 'user.tag', user.tag, 'executor.tag', executor.tag);
}).listen();

// TODO: GuildCreate

// TODO: GuildDelete

registerEvent(Events.GuildEmojiUpdate, (oldEmoji, newEmoji) => newEmoji.guild.id, async function (oldEmoji, newEmoji) {
    const executor = this.latestAuditLog.executor;

    // global.eventsDatabase.addEntry(this.event, {
    //     emojiId: newEmoji.id,
    //     emojiPath: newEmoji.url,
    //     datetime: Date.now(),
    //     executorId: executor.id,
    // });

    reportEvent(this.eventName, 'executor.tag', executor.tag, 'emoji.name', oldEmoji.name, '->', newEmoji.name, 'emoji.url', oldEmoji.url, '->', newEmoji.url);
}).listen();

registerEvent(Events.GuildEmojiDelete, (emoji) => emoji.guild.id, async function (emoji) {
    const executor = this.latestAuditLog.executor;

    // TODO: add 'addEmojiDelete' to DB
    // global.eventsDatabase.addEntry(this.event, {
    //     emojiId: emoji.id,
    //     datetime: Date.now(),
    //     isDelete: true,
    //     executorId: executor.id,
    // });

    reportEvent(this.eventName, 'executor.tag', executor.tag, 'emoji.name', emoji.name, 'emoji.url', emoji.url);
}).listen();

registerEvent(Events.GuildEmojiUpdate, (oldEmoji, newEmoji) => newEmoji.guild.id, async function (oldEmoji, newEmoji) {
    const executor = this.latestAuditLog.executor;

    // global.eventsDatabase.addEntry(this.event, {
    //     emojiId: newEmoji.id,
    //     oldEmojiPath: oldEmoji.url,
    //     newEmojiPath: newEmoji.url,
    //     datetime: Date.now(),
    //     executorId: executor.id,
    // });

    reportEvent(this.eventName, 'executor.tag', executor.tag, 'emoji.name', oldEmoji.name, '->', newEmoji.name, 'emoji.url', oldEmoji.url, '->', newEmoji.url);
}).listen();

// TODO: GuildIntegrationsUpdate

registerEvent(Events.GuildMemberAdd, (member) => member.guild.id, async function (member) {
    const user = member.user;

    // global.eventsDatabase.addEntry(this.event, {
    //     userid: user.id,
    //     joinedAt: Date.now(),
    //     nickname: member.nickname || '',
    // });

    reportEvent(this.eventName, 'user.tag', user.tag);
}).listen();

registerEvent(Events.GuildMemberAvailable, (oldMember, newMember) => newMember.guild.id, async function (oldMember, newMember) {
    // TODO

    reportEvent(this.eventName, 'member.user.tag', member.user.tag);
}).listen();

registerEvent(Events.GuildMemberRemove, (member) => member.guild.id, async function (member) {
    const user = member.user;

    if (this.latestAuditLog?.action === AuditLogEvent.GuildBanAdd && this.latestAuditLog?.target.id === user.id)
        return;

    // TODO: rename leftedAt to leftAt in DB
    // global.eventsDatabase.addEntry(this.event, {
    //     userid: user.id,
    //     leftAt: Date.now(),
    // });

    reportEvent(this.eventName, 'user.tag', user.tag);
}).listen();

// TODO: GuildMembersChunk

registerEvent(Events.GuildMemberUpdate, (oldMember, newMember) => newMember.guild.id, async function (oldMember, newMember) {
    reportEvent(this.eventName, 'user.tag', oldMember.user.tag, '->', newMember.user.tag);
}).listen();

registerEvent(Events.GuildRoleCreate, (role) => role.guild.id, async function (role) {
    const executor = this.latestAuditLog.executor;

    // global.eventsDatabase.addEntry(this.event, {
    //     roleId: role.id,
    //     name: role.name,
    //     color: role.hexColor,
    //     permissions: role.permissions,
    //     datetime: Date.now(),
    //     executorId: executor.id,
    // });

    reportEvent(this.eventName, 'executor.tag', executor.tag, 'role.name', role.name);
}).listen();

registerEvent(Events.GuildRoleDelete, (role) => role.guild.id, async function (role) {
    const executor = this.latestAuditLog.executor;

    // global.eventsDatabase.addEntry(this.event, {
    //     roleId: role.id,
    //     name: role.name,
    //     datetime: Date.now(),
    //     isDelete: true,
    //     executorId: executor.id,
    // });

    reportEvent(this.eventName, 'executor.tag', executor.tag, 'role.name', role.name);
}).listen();

registerEvent(Events.GuildRoleUpdate, (oldRole, newRole) => newRole.guild.id, async function (oldRole, newRole) {
    const executor = this.latestAuditLog.executor;

    // global.eventsDatabase.addEntry(this.event, {
    //     roleId: newRole.id,
    //     name: newRole.name,
    //     datetime: Date.now(),
    //     executorId: executor.id,
    // });

    reportEvent(this.eventName, 'executor.tag', executor.tag, 'role.name', oldRole.name, '->', newRole.name, 'role.color', oldRole.hexColor, '->', newRole.hexColor);
}).listen();

// TODO: GuildScheduledEventCreate

// TODO: GuildScheduledEventDelete

// TODO: GuildScheduledEventUpdate

// TODO: GuildScheduledEventUserAdd

// TODO: GuildScheduledEventUserRemove

registerEvent(Events.GuildStickerCreate, (oldSticker, newSticker) => newSticker.guild.id, async function (oldSticker, newSticker) {
    const executor = this.latestAuditLog.executor;

    // global.eventsDatabase.addEntry(this.event, {
    //     emojiId: sticker.id,
    //     emojiPath: sticker.url,
    //     datetime: Date.now(),
    //     executorId: executor.id,
    // });

    reportEvent(this.eventName, 'executor.tag', executor.tag, 'sticker.name', sticker.name);
}).listen();

registerEvent(Events.GuildStickerDelete, (sticker) => sticker.guild.id, async function (sticker) {
    const executor = this.latestAuditLog.executor;

    // TODO: isDelete?
    // global.eventsDatabase.addEntry(this.event, {
    //     emojiId: sticker.id,
    //     datetime: Date.now(),
    //     // isDelete: true,
    //     executorId: executor.id,
    // });

    reportEvent(this.eventName, 'executor.tag', executor.tag, 'sticker.name', sticker.name);
}).listen();

registerEvent(Events.GuildStickerUpdate, (oldSticker, newSticker) => newSticker.guild.id, async function (oldSticker, newSticker) {
    const executor = this.latestAuditLog.executor;

    // TODO: isDelete? add addStickerUpdate to the DB
    // global.eventsDatabase.addEntry(this.event, {
    //     emojiId: sticker.id,
    //     datetime: Date.now(),
    //     // isDelete: true,
    //     executorId: executor.id,
    // });

    reportEvent(this.eventName, 'executor.tag', executor.tag, 'sticker.name', oldSticker.name, '->', newSticker.name);
}).listen();

// TODO: GuildUnavailable

// TODO: GuildUpdate

registerEvent(Events.InteractionCreate, (interaction) => interaction.guildId, async function (interaction) {
    const executor = interaction.user;

    // global.eventsDatabase.addEntry(this.event, {
    //     type: interaction.type,
    //     datetime: Date.now(),
    //     commandName: interaction.commandName,
    //     executorId: executor.id,
    //     channelid: interaction.channelId,
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
    .set('reportDefault', function (interaction) {
        try {
            reportEvent(this.eventName, 'executor.tag', interaction.user.tag, 'client.tag', interaction.client.user.tag, 'channel.name', interaction.channel.name);
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
            reportEvent(this.eventName, 'executor.tag', interaction.user.tag, 'client.tag', interaction.client.user.tag, 'channel.name', interaction.channel.name, 'command', cmd);
        } catch (err) {
            reportEventError(this.eventName, err);
        }
    })
    .listen();

// TODO: Invalidated

registerEvent(Events.InviteCreate, (invite) => invite.guild.id, async function (invite) {
    const executor =
        invite.inviter || this.latestAuditLog.executor;

    // TODO: remove userid from DB
    // global.eventsDatabase.addEntry(this.event, {
    //     // userid: user.id,
    //     code: invite.code,
    //     channelid: invite.channel.id,
    //     maxUses: invite.maxUses,
    //     expiresAt: invite.expiresTimestamp,
    //     executorId: executor.id,
    //     datetime: Date.now(),
    // });

    reportEvent(this.eventName, 'executor.tag', executor.tag, 'url', invite.url);
}).listen();

registerEvent(Events.InviteDelete, (invite) => invite.guild.id, async function (invite) {
    const executor =
        invite.inviter || this.latestAuditLog.executor;

    // global.eventsDatabase.addEntry(this.event, {
    //     code: invite.code,
    //     channelid: invite.channel.id,
    //     executorId: executor.id,
    //     datetime: Date.now(),
    // });

    reportEvent(this.eventName, 'executor.tag', executor.tag, 'url', invite.url);
}).listen();

registerEvent(Events.MessageBulkDelete, (messages, channel) => channel.guild.id, async function (messages, channel) {
    const executor = this.latestAuditLog.executor;

    // global.eventsDatabase.addEntry(this.event, {
    //     channelId: channel.id,
    //     deletedMessages: messages.size,
    //     datetime: Date.now(),
    //     executorId: executor.id,
    // });

    reportEvent(this.eventName, 'channel.name', channel.name, 'executor.tag', executor.tag, 'messages.size', messages.size);
}).listen();

registerEvent(Events.MessageCreate, (message) => message.guild.id, async function (message) {
    const executor = message.author;
    const channel = message.channel;
    const content = message.content;

    if (message.type === MessageType.ChannelPinnedMessage) return;

    // TODO: rename userId to executorId in DB
    // global.eventsDatabase.addEntry(this.event, {
    //     id: message.id,
    //     userId: executor.id,
    //     channelId: channel.id,
    //     content: content,
    //     datetime: Date.now(),
    //     attachments: filenames ? JSON.stringify(filenames) : null,
    //     isDelete: 0,
    //     isReply: message.reference ? 1 : 0,
    //     replyToMessageId: message.reference ? message.reference.messageId : null,
    // });

    global.messagesDatabase.set(message);

    reportEvent(this.eventName, 'channel.name', channel.name, 'executor.tag', executor.tag, 'content', content);
}).listen();

registerEvent(Events.MessageDelete, (message) => message.guild.id, async function (message) {
    const executor = this.latestAuditLog.executor;

    // global.eventsDatabase.addEntry(this.event, {
    //     messageId: message.id,
    //     datetime: Date.now(),
    //     executorId: executor.id,
    // });

    reportEvent(this.eventName, 'channel.name', message.channel.name, 'executor.tag', executor.tag, 'content', message.content);
}).listen();

// TODO: MessagePollVoteAdd

// TODO: MessagePollVoteRemove

// TODO: ALL REACTIONS ARE NOT WORKING BRUH

registerEvent(Events.MessageReactionAdd, (reaction, executor, details) => reaction.message.guild.id, async function (reaction, executor, details) {
    console.log('MessageReactionAdd');
    // const emoji = reaction.emoji;
    // const message = reaction.message;
    // const user = message.author;

    // global.eventsDatabase.addEntry(this.event, {
    //     reactionId: emoji.id || 0,
    //     messageId: message.id,
    //     userId: user.id,
    //     datetime: Date.now(),
    //     name: emoji.name,
    // });

    // reportEvent(this.eventName, 'executor.tag', executor.tag, 'emoji.name', emoji.name, 'message.author.tag', user.tag);
}).listen();

registerEvent(Events.MessageReactionRemove, (reaction, executor, details) => reaction.message.guild.id, async function (reaction, executor, details) {
    console.log('MessageReactionRemove');
    // const emoji = reaction.emoji;
    // const message = reaction.message;
    // const user = message.author;

    // global.eventsDatabase.addEntry(this.event, {
    //     reactionId: emoji.id || 0,
    //     messageId: message.id,
    //     userId: user.id,
    //     datetime: Date.now(),
    //     name: emoji.name,
    // });

    // reportEvent(this.eventName, 'executor.tag', executor.tag, 'emoji.name', emoji.name, 'message.author.tag', user.tag);
}).listen();

registerEvent(Events.MessageReactionRemoveEmoji, (reaction) => reaction.message.guild.id, async function (reaction) {
    console.log('MessageReactionRemoveEmoji');
}).listen();

registerEvent(Events.MessageUpdate, (oldMessage, newMessage) => newMessage.guild.id, async function (oldMessage, newMessage) {
    const author = oldMessage?.author || newMessage?.author;

    // global.eventsDatabase.addEntry(this.event, {
    //     userId: user.id,
    //     messageId: newMessage.id,
    //     newContent: newMessage.content,
    //     oldContent: oldMessage.content,
    //     datetime: Date.now(),
    // });
    // global.messagesDatabase.update(newMessage);
    // console.log(oldMessage.content, newMessage.content);

    const reportEventArgs = compareOldAndNew(oldMessage, newMessage);

    if (reportEventArgs.length === 0 || (reportEventArgs.length === 4 && reportEventArgs[0] === 'pinned')) return;

    reportEvent(this.eventName, 'channel.name', newMessage.channel.name, 'author.tag', author.tag, ...reportEventArgs);
}).listen();

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

registerEvent(Events.ThreadCreate, (thread, newlyCreated) => thread.guild.id, async function (thread, newlyCreated) {
    const executor = this.latestAuditLog.executor;

    // global.eventsDatabase.addEntry(this.event, {
    //     channelId: thread.id,
    //     name: thread.name,
    //     permissions: thread.permissionOverwrites.cache,
    //     datetime: Date.now(),
    //     executorId: executor.id,
    // });

    reportEvent(this.eventName, 'executor.tag', executor.tag, 'thread.name', thread.name);
}).listen();

registerEvent(Events.ThreadDelete, (thread) => thread.guild.id, async function (thread) {
    const executor = this.latestAuditLog.executor;

    // global.eventsDatabase.addEntry(this.event, {
    //     channelId: thread.id,
    //     name: thread.name,
    //     permissions: thread.permissionOverwrites.cache,
    //     datetime: Date.now(),
    //     executorId: executor.id,
    // });

    reportEvent(this.eventName, 'executor.tag', executor.tag, 'thread.name', thread.name);
}).listen();

// TODO: ThreadListSync

// TODO: ThreadMembersUpdate

// TODO: ThreadMemberUpdate

registerEvent(Events.ThreadUpdate, (oldThread, newThread) => newThread.guild.id, async function (oldThread, newThread) {
    executor = this.latestAuditLog.executor;

    // global.eventsDatabase.addEntry(this.event, { channelId: newThread.id, oldName: oldThread.name, newName: newThread.name, datetime: Date.now(), executorId: executor.id, });

    reportEvent(this.eventName, 'executor.tag', executor.tag, 'thread.name', oldThread.name, '->', newThread.name
    );
}).listen();

// TODO: TypingStart

// TODO: UserUpdate

// TODO: VoiceServerUpdate

registerEvent(Events.VoiceStateUpdate, (oldState, newState) => newState.guild.id, async function (oldState, newState) {
    this.oldState = oldState;
    this.newState = newState;
    if (!oldState.channelId && !newState.channelId) {
        this.impossibleCaseReached('old and new states are null');
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
                    this.impossibleCaseReached('old and new states are equal with no update');
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
    reportEvent(this.eventName, 'user.tag', user.tag, 'channel.name', channel.name);
})
    .set('count', global.latestAuditLogCount || 0)
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
    })
    .set('impossibleCaseReached', function (msg) {
        reportEventWarn(this.eventName, 'impossible case reached:', msg);
        const module = require(eventToPath(this.event));
        module.event = this.event;
        module.callback(this.oldState, this.newState);
    })
    .listen();

// TODO: Warn

// TODO: WebhooksUpdate
