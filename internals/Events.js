'use strict';
const path = require('path');
const { AuditLogEvent, Events } = require('discord.js');
require('puparia.getlines.js');

function formatArgs(...args) {
    let i = 0;
    let formattedArgs = '';
    while (i < args.length) {
        formattedArgs += ` ${colors['FgCyan']}${args[i]}${colors['Reset']}="${colors['FgYellow']}${args[i + 1]}${colors['Reset']}"`;
        if (i + 2 < args.length && args[i + 2] === '->') {
            formattedArgs += `->"${colors['FgYellow']}${args[i + 3]}${colors['Reset']}"`;
            i += 2;
        }
        i += 2;
    }
    return formattedArgs;
}

function shouldLog(eventName, ...args) {
    return global.global.reportEvents && global.configReportEvents[eventName];
}

const reportEvent = console.createReportFunction(__filename, formatArgs, shouldLog);
const reportEventError = console.createReportErrorFunction(__filename);

/*
Events Enum
https://discord.js.org/docs/packages/discord.js/14.16.1/Events:Enum
Events callback arguments
https://discord.js.org/docs/packages/discord.js/14.16.1/ClientEvents:Interface
*/

/*
Audit Log Events Enum

https://github.com/discordjs/discord-api-types/blob/main/payloads/v10/auditLog.ts#L137

export enum AuditLogEvent {
	GuildUpdate = 1,

	ChannelCreate = 10,
	ChannelUpdate,
	ChannelDelete,
	ChannelOverwriteCreate,
	ChannelOverwriteUpdate,
	ChannelOverwriteDelete,

	MemberKick = 20,
	MemberPrune,
	MemberBanAdd,
	MemberBanRemove,
	MemberUpdate,
	MemberRoleUpdate,
	MemberMove,
	MemberDisconnect,
	BotAdd,

	RoleCreate = 30,
	RoleUpdate,
	RoleDelete,

	InviteCreate = 40,
	InviteUpdate,
	InviteDelete,

	WebhookCreate = 50,
	WebhookUpdate,
	WebhookDelete,

	EmojiCreate = 60,
	EmojiUpdate,
	EmojiDelete,

	MessageDelete = 72,
	MessageBulkDelete,
	MessagePin,
	MessageUnpin,

	IntegrationCreate = 80,
	IntegrationUpdate,
	IntegrationDelete,
	StageInstanceCreate,
	StageInstanceUpdate,
	StageInstanceDelete,

	StickerCreate = 90,
	StickerUpdate,
	StickerDelete,

	GuildScheduledEventCreate = 100,
	GuildScheduledEventUpdate,
	GuildScheduledEventDelete,

	ThreadCreate = 110,
	ThreadUpdate,
	ThreadDelete,

	ApplicationCommandPermissionUpdate = 121,

	AutoModerationRuleCreate = 140,
	AutoModerationRuleUpdate,
	AutoModerationRuleDelete,
	AutoModerationBlockMessage,
	AutoModerationFlagToChannel,
	AutoModerationUserCommunicationDisabled,

	CreatorMonetizationRequestCreated = 150,
	CreatorMonetizationTermsAccepted,

	OnboardingPromptCreate = 163,
	OnboardingPromptUpdate,
	OnboardingPromptDelete,
	OnboardingCreate,
	OnboardingUpdate,

	HomeSettingsCreate = 190,
	HomeSettingsUpdate,
}
*/

// const eventsFile = path.join(__dirname, 'events.json');

// function logEvent(eventType, eventData) {
//     let events = [];
//     if (fs.existsSync(eventsFile)) {
//         const data = fs.readFileSync(eventsFile, 'utf8');
//         events = JSON.parse(data);
//     }
//     const dateParis = new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' });
//     const dateObject = new Date(dateParis);
//     const epochParis = dateObject.getTime();
//     const epochSecondsParis = Math.floor(epochParis / 1000);
//     const newEvent = {
//         type: eventType,
//         datetime: epochSecondsParis,
//         ...eventData,
//     };

//     events.push(newEvent);
//     fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2), 'utf8');
// }

// TODO: ApplicationCommandPermissionsUpdate

// TODO: AutoModerationActionExecution

// TODO: AutoModerationRuleCreate 

// TODO: AutoModerationRuleDelete

// TODO: AutoModerationRuleUpdate

// TODO: CacheSweep

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
    
    return path.join('../', process.env.events_folder_path, category, String(event) + '.js');
}

{
    const event = Events.ChannelCreate;
    let eventName;

    global.client.on(event, async (channel) => {
        eventName = String(event);

        try {
            if (global.guild.id !== channel.guild.id) return;
            
            const executor = (await global.guild.latestAuditLog()).executor;
            
            global.database.addEntry('EVENTS_'+eventName, {
                channelId: channel.id,
                name: channel.name,
                permissions: channel.permissionOverwrites.cache,
                datetime: Date.now(),
                executorId: executor.id,
            });

            reportEvent(__line, eventName, 'executor.tag', executor.tag, 'channel.type', global.guild.channelTypeStr(channel.type), 'channel.name', channel.name);
            require(eventtopath(event))(channel);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

{
    const event = Events.ChannelDelete;
    let eventName;

    global.client.on(event, async (channel) => {
        eventName = String(event);

        try {
            if (global.guild.id !== channel.guild.id) return;

            const executor = (await global.guild.latestAuditLog()).executor;

            global.database.addEntry('EVENTS_'+eventName, {
                channelId: channel.id,
                name: channel.name,
                permissions: channel.permissionOverwrites.cache,
                datetime: Date.now(),
                isDelete: true,
                executorId: executor.id,
            });

            reportEvent(__line, eventName, 'executor.tag', executor.tag, 'channel.type', global.guild.channelTypeStr(channel.type), 'channel.name', channel.name);
            require(eventtopath(event))(channel);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }  
    });
}

{
    const event = Events.ChannelPinsUpdate;
    let eventName;

    global.client.on(event, async (channel, date)  => {
        eventName = String(event);

        try {
            if (global.guild.id !== channel.guild.id) return;

            // TODO

            reportEvent(__line, eventName);
            require(eventtopath(event))(channel, date);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

{
    const event = Events.ChannelUpdate;
    let eventName;

    global.client.on(event, async (oldChannel, newChannel) => {
        eventName = String(event);

        try {
            if (global.guild.id !== newChannel.guild.id) return;

            const executor = (await global.guild.latestAuditLog()).executor;

            const executorId = (await global.guild.latestAuditLog()).executorId;
            global.database.addEntry('EVENTS_'+eventName, {
                channelId: newChannel.id,
                oldName: oldChannel.name,
                newName: newChannel.name,
                oldPermissions: oldChannel.permissionOverwrites.cache,
                newPermissions: newChannel.permissionOverwrites.cache,
                datetime: Date.now(),
                executorId: executor.id,
            });

            reportEvent(__line, eventName, 'executor.tag', executor.tag, 'channel.type', global.guild.channelTypeStr(newChannel.type), 'channel.name', oldChannel.name, '->', newChannel.name);
            require(eventtopath(event))(oldChannel, newChannel);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

// DONE: ClientReady

// TODO: Debug

// TODO: EntitlementCreate

// TODO: EntitlementDelete

// TODO: EntitlementUpdate

// TODO: Error

// TODO: GuildAuditLogEntryCreate

// TODO: GuildAvailable

{
    const event = Events.GuildBanAdd;
    let eventName;

    global.client.on(event, async (ban) => {
        eventName = String(event);

        try {
            if (global.guild.id !== ban.guild.id) return;

            const user = ban.user;
            const executor = (await global.guild.latestAuditLog()).executor;

            global.database.addEntry('EVENTS_'+eventName, {
                userid: user.id,
                reason: ban.reason,
                datetime: Date.now(),
                executorId: executor.id,
            });

            reportEvent(__line, eventName, 'user.tag', user.tag, 'executor.tag', executor.tag, 'reason', ban.reason);
            require(eventtopath(event))(ban);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

{
    const event = Events.GuildBanRemove;
    let eventName;

    global.client.on(event, async (ban) => {
        eventName = String(event);

        try {
            if (global.guild.id !== ban.guild.id) return;

            const user = ban.user;
            const executor = (await global.guild.latestAuditLog()).executor;

            global.database.addEntry('EVENTS_'+eventName, {
                userid: user.id,
                datetime: Date.now(),
                isDelete: true,
                executorId: executor.id,
            });

            reportEvent(__line, eventName, 'user.tag', user.tag, 'executor.tag', executor.tag);
            require(eventtopath(event))(ban);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

// TODO: GuildCreate

// TODO: GuildDelete

{
    const event = Events.GuildEmojiCreate;
    let eventName;

    global.client.on(event, async (emoji) => {
        eventName = String(event);

        try {
            if (global.guild.id !== emoji.guild.id) return;

            const executor = (await global.guild.latestAuditLog()).executor;

            global.database.addEntry('EVENTS_'+eventName, {
                emojiId: emoji.id,
                emojiPath: emoji.url,
                datetime: Date.now(),
                executorId: executor.id,
            });

            reportEvent(__line, eventName, 'executor.tag', executor.tag, 'emoji.name', emoji.name, 'emoji.url', emoji.url);
            require(eventtopath(event))(emoji);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

{
    const event = Events.GuildEmojiDelete;
    let eventName;

    global.client.on(event, async (emoji) => {
        eventName = String(event);

        try {
            if (global.guild.id !== emoji.guild.id) return;

            const executor = (await global.guild.latestAuditLog()).executor;
            
            // TODO: add "addEmojiDelete" to DB
            global.database.addEntry('EVENTS_'+eventName, {
                emojiId: emoji.id,
                datetime: Date.now(),
                isDelete: true,
                executorId: executor.id,
            });

            reportEvent(__line, eventName, 'executor.tag', executor.tag, 'emoji.name', emoji.name, 'emoji.url', emoji.url);
            require(eventtopath(event))(emoji);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

{
    const event = Events.GuildEmojiUpdate;
    let eventName;

    global.client.on(event, async (oldEmoji, newEmoji) => {
        eventName = String(event);

        try {
            if (global.guild.id !== newEmoji.guild.id) return;

            const executor = (await global.guild.latestAuditLog()).executor;
            
            global.database.addEntry('EVENTS_'+eventName, {
                emojiId: newEmoji.id,
                oldEmojiPath: oldEmoji.url,
                newEmojiPath: newEmoji.url,
                datetime: Date.now(),
                executorId: executor.id,
            });

            reportEvent(__line, eventName, 'executor.tag', executor.tag, 'emoji.name', oldEmoji.name, '->', newEmoji.name, 'emoji.url', oldEmoji.url, '->', newEmoji.url);
            require(eventtopath(event))(oldEmoji, newEmoji);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

// TODO: GuildIntegrationsUpdate

{
    const event = Events.GuildMemberAdd;
    let eventName;

    global.client.on(event, (member) => {
        eventName = String(event);

        try {
            if (global.guild.id !== member.guild.id) return;

            const user = member.user;

            global.database.addEntry('EVENTS_'+eventName, {
                userid: user.id,
                joinedAt: Date.now(),
                nickname: member.nickname || '',
            });

            reportEvent(__line, eventName, 'user.tag', user.tag);
            require(eventtopath(event))(member);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

{
    const event = Events.GuildMemberAvailable;
    let eventName;

    global.client.on(event, async (member) => {
        eventName = String(event);

        try {
            if (global.guild.id !== member.guild.id) return;

            // TODO

            reportEvent(__line, eventName, 'member.user.tag', member.user.tag);
            require(eventtopath(event))(member);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

{
    const event = Events.GuildMemberRemove;
    let eventName;

    global.client.on(event, async (member) => {
        eventName = String(event);

        try {
            if (global.guild.id !== member.guild.id) return;

            const user = member.user;

            const latestAuditLog = await global.guild.latestAuditLog();
            if (latestAuditLog?.action === AuditLogEvent.GuildBanAdd && latestAuditLog?.target.id === user.id) return;

            // TODO: rename leftedAt to leftAt in DB
            global.database.addEntry('EVENTS_'+eventName, {
                userid: user.id,
                leftAt: Date.now(),
            });

            reportEvent(__line, eventName, 'user.tag', user.tag);
            require(eventtopath(event))(member);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

// TODO: GuildMembersChunk

{
    const event = Events.GuildMemberUpdate;
    let eventName;

    global.client.on(event, async (oldMember, newMember) => {
        eventName = String(event)

        try {
            if (global.guild.id !== newMember.guild.id) return;

            // TODO

            // let data = {}
            // let trigger = false

            // if(oldMember.nickname !== newMember.nickname){
            //     data.oldNickname= oldMember.nickname,
            //     data.newNickname= newMember.nickname,
            //     trigger = true
            // }

            // if(oldMember.displayName !== newMember.displayName){
            //     data.oldDisplayName= oldMember.displayName,
            //     data.newDisplayName= newMember.displayName,
            
            //     trigger = true

            // }

            // if(oldMember.displayAvatarURL !== newMember.displayAvatarURL){
            //     data.oldAvatar = oldMember.displayAvatarURL,
            //     data.newAvatar = newMember.displayAvatarURL,
            //     trigger = true

            // }

            // if(trigger){
            //     await global.database.addGuildMemberUpdate(data);
            // }

            reportEvent(__line, eventName, 'user.tag', oldMember.user.tag, '->', newMember.user.tag);
            require(eventtopath(event))(oldMember, newMember);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

{
    const event = Events.GuildRoleCreate;
    let eventName;

    global.client.on(event, async (role) => {
        eventName = String(event);

        try {
            if (global.guild.id !== invite.guild.id) return;

            const executor = (await global.guild.latestAuditLog()).executor;

            global.database.addEntry('EVENTS_'+eventName, {
                roleId: role.id,
                name: role.name,
                color: role.hexColor,
                permissions: role.permissions,
                datetime: Date.now(),
                executorId: executor.id,
            });

            reportEvent(__line, eventName, 'executor.tag', executor.tag, 'role.name', role.name);
            require(eventtopath(event))(role);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

{
    const event = Events.GuildRoleDelete;
    let eventName;

    global.client.on(event, async (role) => {
        eventName = String(event);

        try {
            if (global.guild.id !== invite.guild.id) return;

            const executor = (await global.guild.latestAuditLog()).executor;

            global.database.addEntry('EVENTS_'+eventName, {
                roleId: role.id,
                name: role.name,
                datetime: Date.now(),
                isDelete: true,
                executorId: executor.id,
            });

            reportEvent(__line, eventName, 'executor.tag', executor.tag, 'role.name', role.name);
            require(eventtopath(event))(role);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

{
    const event = Events.GuildRoleUpdate;
    let eventName;

    global.client.on(event, async (oldRole, newRole) => {
        eventName = String(event);

        try {
            if (global.guild.id !== invite.guild.id) return;

            const executor = (await global.guild.latestAuditLog()).executor;

            global.database.addEntry('EVENTS_'+eventName, {
                roleId: newRole.id,
                name: newRole.name,
                datetime: Date.now(),
                executorId: executor.id,
            });

            reportEvent(__line, eventName, 'executor.tag', executor.tag, 'role.name', oldRole.name, '->', newRole.name, 'role.color', oldRole.hexColor, '->', newRole.hexColor);
            require(eventtopath(event))(role);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

// TODO: GuildScheduledEventCreate

// TODO: GuildScheduledEventDelete

// TODO: GuildScheduledEventUpdate

// TODO: GuildScheduledEventUserAdd

// TODO: GuildScheduledEventUserRemove

{
    const event = Events.GuildStickerCreate;
    let eventName;

    global.client.on(event, async (sticker) => {
        eventName = String(event);

        try {
            if (global.guild.id !== sticker.guild.id) return;

            const executor = (await global.guild.latestAuditLog()).executor;

            global.database.addEntry('EVENTS_'+eventName, {
                emojiId: sticker.id,
                emojiPath: sticker.url,
                datetime: Date.now(),
                executorId: executor.id,
            });

            reportEvent(__line, eventName, 'executor.tag', executor.tag, 'sticker.name', sticker.name);
            require(eventtopath(event))(sticker);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

{
    const event = Events.GuildStickerDelete;
    let eventName;

    global.client.on(event, async (sticker) => {
        eventName = String(event)

        try {
            if (global.guild.id !== sticker.guild.id) return;

            const executor = (await global.guild.latestAuditLog()).executor;

            // TODO: isDelete?
            global.database.addEntry('EVENTS_'+eventName, {
                emojiId: sticker.id,
                datetime: Date.now(),
                // isDelete: true,
                executorId: executor.id,
            });

            reportEvent(__line, eventName, 'executor.tag', executor.tag, 'sticker.name', sticker.name);
            require(eventtopath(event))(sticker);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}


{
    const event = Events.GuildStickerUpdate;
    let eventName = String(event)

    global.client.on(event, async (oldSticker, newSticker) => {
        try {
            if (global.guild.id !== sticker.guild.id) return;

            const executor = (await global.guild.latestAuditLog()).executor;

            // TODO: isDelete? add addStickerUpdate to the DB
            global.database.addEntry('EVENTS_'+eventName, {
                emojiId: sticker.id,
                datetime: Date.now(),
                // isDelete: true,
                executorId: executor.id,
            });

            reportEvent(__line, eventName, 'executor.tag', executor.tag, 'sticker.name', oldSticker.name, '->', newSticker.name);
            require(eventtopath(event))(sticker);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

// TODO: GuildUnavailable

// TODO: GuildUpdate

{
    const event = Events.InteractionCreate;
    let eventName = String(event);

    const reportDefault = (interaction) => {
        try {
            reportEvent(__line, eventName, 'executor.tag', interaction.user.tag, 'client.tag', interaction.client.user.tag, 'channel.name', interaction.channel.name);
        } catch(err) {
            reportEventError(__line, eventName, err);
        }
    } 

    function reportChatInputCommand(interaction) {
        const functionName = 'reportChatInputCommand';
        eventName += '.chatInputCommand';
        try {
            // console.log(interaction.options);
            // console.log(JSON.stringify(interaction.options, null, 4));
            let cmd = `/${interaction.commandName}`;
            for (const option of interaction.options._hoistedOptions) {
                switch (option.type) {
                    case 3:
                        cmd += ` ${option.name}: ${option.value}`;
                        break;
                    case 6:
                        cmd += ` user: @${option.member.displayName}`;
                        break;
                    default:
                        console.warn(`${__filename} - Line ${__line} (${functionName}): unsupported option type: ${option.type}`);
                        break;
                }
            }
            reportEvent(__line, eventName, 'executor.tag', interaction.user.tag, 'client.tag', interaction.client.user.tag, 'channel.name', interaction.channel.name, 'command', cmd);
        } catch(err) {
            reportEventError(__line, eventName, err);
        }
    }

    global.client.on(event, (interaction) => {
        try {
            if (global.guild.id !== interaction.guildId) return;
            
            const executor = interaction.user;

            global.database.addEntry('EVENTS_'+eventName, {
                type: interaction.type,
                datetime: Date.now(),
                commandName: interaction.commandName,
                executorId: executor.id,
                channelid: interaction.channelId,
            });

            if (interaction.isAutocomplete()) {
                eventName += '.autocomplete';
                reportDefault(interaction);
            } else if (interaction.isButton()) {
                eventName += '.button';
                reportDefault(interaction);
            } else if (interaction.isMessageComponent()) {
                eventName += '.messageComponent';
                reportDefault(interaction);
            } else if (interaction.isModalSubmit()) {
                eventName += '.modalSubmit';
                reportDefault(interaction);
            } else if (interaction.isChatInputCommand()) {
                reportChatInputCommand(interaction);
            } else if (interaction.isUserContextMenuCommand()) {
                eventName += '.userContextMenuCommand';
                reportDefault(interaction);
            } else if (interaction.isContextMenuCommand()) {
                eventName += '.contextMenuCommand';
                reportDefault(interaction);
            } else if (interaction.isMessageContextMenuCommand()) {
                eventName += '.messageContextMenuCommand';
                reportDefault(interaction);
            } else if (interaction.isStringSelectMenu()) {
                eventName += '.stringSelectMenu';
                reportDefault(interaction);
            } else if (interaction.isUserSelectMenu()) {
                eventName += '.userSelectMenu';
                reportDefault(interaction);
            } else if (interaction.isRoleSelectMenu()) {
                eventName += '.roleSelectMenu';
                reportDefault(interaction);
            } else if (interaction.isMentionableSelectMenu()) {
                eventName += '.mentionableSelectMenu';
                reportDefault(interaction);
            } else if (interaction.isChannelSelectMenu()) {
                eventName += '.channelSelectMenu';
                reportDefault(interaction);
            } else {
                console.warn(`${__filename} - Line ${__line} (${eventName}): unknown interaction of type "${interaction.type}"`);
            }

            require(eventtopath(event))(interaction);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

// TODO: Invalidated

{
    const event = Events.InviteCreate;
    let eventName = String(event);

    global.client.on(event, async (invite) => {
        try {
            if (global.guild.id !== invite.guild.id) return;

            const executor = invite.inviter || (await global.guild.latestAuditLog()).executor;
        
            // TODO: remove userid from DB
            global.database.addEntry('EVENTS_'+eventName, {
                // userid: user.id,
                code: invite.code,
                channelid: invite.channel.id,
                maxUses: invite.maxUses,
                expiresAt: invite.expiresTimestamp,
                executorId: executor.id,
                datetime: Date.now(),
            });

            reportEvent(__line, eventName, 'executor.tag', executor.tag, 'url', invite.url);
            require(eventtopath(event))(invite);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

{
    const event = Events.InviteDelete;
    let eventName = String(event);

    global.client.on(event, async (invite) => {
        try {
            if (global.guild.id !== invite.guild.id) return;
            
            const executor = invite.inviter || (await global.guild.latestAuditLog()).executor;
            
            global.database.addEntry('EVENTS_'+eventName, {
                code: invite.code,
                channelid: invite.channel.id,
                executorId: executor.id,
                datetime: Date.now(),
            });

            reportEvent(__line, eventName, 'executor.tag', executor.tag, 'url', invite.url);
            require(eventtopath(event))(invite);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

{
    const event = Events.MessageBulkDelete;
    let eventName = String(event);

    global.client.on(event, async (messages, channel) => {
        try {
            if (global.guild.id !== channel.guild.id) return;

            const executor = (await global.guild.latestAuditLog()).executor;

            global.database.addEntry('EVENTS_'+eventName, {
                channelId: channel.id,
                deletedMessages: messages.size,
                datetime: Date.now(),
                executorId: executor.id,
            });

            reportEvent(__line, eventName, 'executor.tag', executor.tag, 'messages.size', messages.size);
            require(eventtopath(event))(messages, channel);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

{
    const event = Events.MessageCreate;
    let eventName = String(event);

    global.client.on(event, async (message) => {
        try {
            if (global.guild.id !== message.guild.id) return;
           
            const executor = message.author;
            const channel = message.channel;
            const content = message.content;

            // TODO: rename userId to executorId in DB
            const attachments = await global.attachment.handleAttachments(message)
            const filenames = attachments.map(attachment => attachment.filename);
            global.database.addEntry('EVENTS_'+eventName, {
                userId: executor.id,
                messageId: message.id,
                channelId: channel.id,
                content: content,
                datetime: Date.now(),
                attachments: JSON.stringify(filenames),
                isDelete: 0,
                isReply: message.reference ? 1 : 0,
                replyToMessageId: message.reference ? message.reference.messageId : null,
            });


            reportEvent(__line, eventName, 'executor.tag', executor.tag, 'channel.name', channel.name, 'content', content);
            require(eventtopath(event))(message);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

{
    const event = Events.MessageDelete;
    let eventName = String(event);

    global.client.on(event, async (message) => {
        try {
            if (global.guild.id !== message.guild.id) return;

            const executor = (await global.guild.latestAuditLog()).executor;
            
            global.database.addEntry('EVENTS_'+eventName, {
                messageId: message.id,
                datetime: Date.now(),
                executorId: executor.id,
            });

            reportEvent(__line, eventName, 'executor.tag', executor.tag, 'channel.name', message.channel.name, 'content', message.content);
            require(eventtopath(event))(message);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

// TODO: MessagePollVoteAdd

// TODO: MessagePollVoteRemove

{
    const event = Events.MessageReactionAdd;
    let eventName = String(event);

    global.client.on(event, (reaction, executor, details) => {
        try {
            if (global.guild.id !== reaction.message.guild.id) return;

            const emoji = reaction.emoji;
            const message = reaction.message;
            const user = message.author;

            global.database.addEntry('EVENTS_'+eventName, {
                reactionId: emoji.id || 0,
                messageId: message.id,
                userId: user.id,
                datetime: Date.now(),
                name: emoji.name
            });

            reportEvent(__line, eventName, 'executor.tag', executor.tag, 'emoji.name', emoji.name, 'message.author.tag', user.tag);
            require(eventtopath(event))(reaction, executor, details);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

{
    const event = Events.MessageReactionRemove;
    let eventName = String(event);

    global.client.on(event, (reaction, executor, details) => {
        try {
            if (global.guild.id !== reaction.message.guild.id) return;

            const emoji = reaction.emoji;
            const message = reaction.message;
            const user = message.author;

            global.database.addEntry('EVENTS_'+eventName, {
                reactionId: emoji.id || 0,
                messageId: message.id,
                userId: user.id,
                datetime: Date.now(),
                name: emoji.name
            });

            reportEvent(__line, eventName, 'executor.tag', executor.tag, 'emoji.name', emoji.name, 'message.author.tag', user.tag);
            require(eventtopath(event))(reaction, executor, details);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

{
    const event = Events.MessageReactionRemoveAll;
    let eventName = String(event);

    global.client.on(event, async (message, reactions) => {
        try {
            if (global.guild.id !== reactions.message.guild.id) return;

            // TODO

            require(eventtopath(event))(message, reactions);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

{
    const event = Events.MessageReactionRemoveEmoji;
    let eventName = String(event);

    global.client.on(event, async (reaction) => {
        try {
            if (global.guild.id !== reaction.message.guild.id) return;

            // TODO

            require(eventtopath(event))(reactions);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

{
    const event = Events.MessageUpdate;
    let eventName = String(event);

    global.client.on(event, (oldMessage, newMessage) => {
        try {
            if (global.guild.id !== invite.guild.id) return;

            const user = oldMessage?.author || newMessage?.author;

            global.database.addEntry('EVENTS_'+eventName, {
                userId: user.id,
                messageId: newMessage.id,
                newContent: newMessage.content,
                oldContent: oldMessage.content,
                datetime: Date.now(),
            });

            reportEvent(__line, eventName, 'user.tag', user.tag, 'channel.name', newMessage.channel.name, 'content', oldMessage.content, '->', newMessage.content);
            require(eventtopath(event))(oldMessage, newMessage);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

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

{
    const event = Events.ThreadCreate;
    let eventName = String(event);

    global.client.on(event, async (thread, newlyCreated) => {
        try {
            if (global.guild.id !== thread.guild.id) return;

            const executor = (await global.guild.latestAuditLog()).executor;

            global.database.addEntry('EVENTS_'+eventName, {
                channelId: thread.id,
                name: thread.name,
                permissions: thread.permissionOverwrites.cache,
                datetime: Date.now(),
                executorId: executor.id,
            });

            reportEvent(__line, eventName, 'executor.tag', executor.tag, 'thread.name', thread.name);
            require(eventtopath(event))(thread, newlyCreated);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

{
    const event = Events.ThreadDelete;
    let eventName = String(event);

    global.client.on(event, async (thread) => {
        try {
            if (global.guild.id !== thread.guild.id) return;

            const executor = (await global.guild.latestAuditLog()).executor;

            global.database.addEntry('EVENTS_'+eventName, {
                channelId: thread.id,
                name: thread.name,
                permissions: thread.permissionOverwrites.cache,
                datetime: Date.now(),
                executorId: executor.id,
            });

            reportEvent(__line, eventName, 'executor.tag', executor.tag, 'thread.name', thread.name);
            require(eventtopath(event))(thread);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

// TODO: ThreadListSync

// TODO: ThreadMembersUpdate

// TODO: ThreadMemberUpdate

{
    const event = Events.ThreadUpdate;
    let eventName = String(event);

    global.client.on(event, async (oldThread, newThread) => {
        try {
            if (global.guild.id !== newThread.guild.id) return;

            const executor = (await global.guild.latestAuditLog()).executor;

            global.database.addEntry('EVENTS_'+eventName, {
                channelId: newThread.id,
                oldName: oldThread.name,
                newName: newThread.name,
                datetime: Date.now(),
                executorId: executor.id,
            });

            reportEvent(__line, eventName, 'executor.tag', executor.tag, 'thread.name', oldThread.name, '->', newThread.name);
            require(eventtopath(event))(oldThread, newThread);
        } catch (err) {
            reportEventError(__line, eventName, err);
        }
    });
}

// TODO: TypingStart

// TODO: UserUpdate

// TODO: VoiceServerUpdate

{
    const event = Events.VoiceStateUpdate;
    let eventName = String(event);

    let count = global.initCount;
    let now;

    async function getExecutor(auditLogEventType) {
        const latestAuditLog = await global.guild.latestAuditLog();
        if (!latestAuditLog) return null;
        const dt = now - latestAuditLog.createdTimestamp;
        if (latestAuditLog.action === auditLogEventType && (dt < 1000 || latestAuditLog.extra.count - count === 1)) {
            count = latestAuditLog.extra.count;
            return latestAuditLog.executor;
        }
        return null;
    }

    global.client.on(event, async (oldState, newState) => {
        
        try {

            if (global.guild.id !== newState.guild.id) return;

            const impossibleCaseReached = function (msg) {
                console.warn(`${__filename} - Line ${__line} (${eventName}): impossible case reached: ${msg}`);
                require(eventtopath(event))(oldState, newState);
            }

            if (!oldState.channelId && !newState.channelId) {
                impossibleCaseReached('old and new states are null');
                return;
            };

            let user, channel, executor, updates;

            let now = Date.now();
            let args
            const voiceStateUpdateObject = function(user, executor, eventType) {
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
                    eventType: eventType
                }
            };

            if (oldState.channelId) {
                user = oldState.member.user;
                channel = oldState.channel;

                if (newState.channelId) {
                    if (oldState.channelId !== newState.channelId) {
                        eventName += '.move';

                        executor = await getExecutor(AuditLogEvent.MemberMove);
                        global.database.addEntry('EVENTS_'+event, voiceStateUpdateObject(user, executor || user, 2));
                    }
                    else {
                        eventName += '.update';

                        updates = [];
                        
                        if (oldState.serverDeaf !== newState.serverDeaf) {
                            executor = await getExecutor(AuditLogEvent.MemberUpdate);
                            updates.push('user.serverDeaf', oldState.serverDeaf, '->', newState.serverDeaf);
                        }
                        if (oldState.serverMute !== newState.serverMute) {
                            executor = await getExecutor(AuditLogEvent.MemberUpdate);
                            updates.push('user.serverMute', oldState.serverMute, '->', newState.serverMute);
                        }
                        if (oldState.selfMute !== newState.selfMute) updates.push('user.selfMute', oldState.selfMute, '->', newState.selfMute);
                        if (oldState.selfDeaf !== newState.selfDeaf) updates.push('user.selfDeaf', oldState.selfDeaf, '->', newState.selfDeaf);
                        if (oldState.streaming !== newState.streaming) updates.push('user.streaming', oldState.streaming, '->', newState.streaming);
                        if (oldState.selfVideo !== newState.selfVideo) updates.push('user.selfVideo', oldState.selfVideo, '->', newState.selfVideo);

                        if (updates.length === 0) {
                            impossibleCaseReached('old and new states are equal with no update');
                            return;
                        }

                        global.database.addEntry('EVENTS_'+event, voiceStateUpdateObject(user, executor || user, 4));
                    }
                }
                else {
                    eventName += '.leave';

                    executor = await getExecutor(AuditLogEvent.MemberDisconnect);
                    global.database.addEntry('EVENTS_'+event, voiceStateUpdateObject(user, executor || user, 3));
                }
            }
            else {
                eventName += '.join';

                user = newState.member.user;
                channel = newState.channel;

                executor = await getExecutor(AuditLogEvent.MemberMove);
                global.database.addEntry('EVENTS_'+event, voiceStateUpdateObject(user, executor || user, 1));
            }

            args = [__line, eventName, 'user.tag', user.tag, 'channel.name', channel.name];
            if (executor) args.push('executor.tag', executor.tag);
            reportEvent(...args, ...updates);
 

            require(eventToPath(event))(oldState, newState);
        } catch (err) {
            reportEventError(__line, eventName, err);
            console.log(__line, eventName, err)
        }
    }); 
}

// TODO: Warn

// TODO: WebhooksUpdate