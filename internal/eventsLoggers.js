'use strict';
const fs = require('fs');
const path = require('path');
const {AuditLogEvent} = require('discord.js')

const eventsFile = path.join(__dirname, 'events.json');
/**
 * Logs an event in the events.json file.
 * @param {string} eventType The type of event to log.
 * @param {Object} eventData The data to log with the event.
 */
function logEvent(eventType, eventData) {
    let events = [];
    if (fs.existsSync(eventsFile)) {
        const data = fs.readFileSync(eventsFile, 'utf8');
        events = JSON.parse(data);
    }
    const dateParis = new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' });
    const dateObject = new Date(dateParis);
    const epochParis = dateObject.getTime();
    const epochSecondsParis = Math.floor(epochParis / 1000);
    const newEvent = {
        type: eventType,
        datetime: epochSecondsParis,
        ...eventData,
    };

    events.push(newEvent);
    fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2), 'utf8');
}

/**
 * Gets the ID of the executor of the latest audit log entry of the given type that targets the given ID.
 * @param {Guild} guild - The guild to get the audit log from.
 * @param {AuditLogEvent} actionType - The type of audit log to look for.
 * @param {string} targetId - The ID of the target to look for.
 * @returns {string|null} The ID of the executor, or null if the audit log is not available or if the target is not found.
 * @throws {Error} If there is an error fetching the audit log.
 */
const getAuditExecutor = async (guild, actionType, targetId) => {
    try {
        const fetchedLogs = await guild.fetchAuditLogs({
            limit: 1,
            type: actionType,
        });
        console.log(fetchedLogs.entries.values().next().value.executorId)

        return fetchedLogs.entries.values().next().value.executorId || null;
    } catch (error) {
        console.error(`Error fetching audit logs: ${error}`);
        return 'Unknown';
    }
};

global.client.on('guildMemberAdd', member => {
    global.Database.addGuildMemberAdd({
        userid: member.id,
        joinedAt: Date.now(),
        nickname: member.nickname || '',
    });
});

global.client.on('guildMemberRemove', member => {
    global.Database.addGuildMemberRemove({
        userid: member.id,
        leftedAt: Date.now(),
    });
});

global.client.on('messageCreate', message => {
    global.Database.addMessageCreate({
        userId: message.author.id,
        messageId: message.id,
        channelId: message.channel.id,
        content: message.content,
        datetime: Date.now(),
        attachments: JSON.stringify(Array.from(message.attachments.values()).map(att => att.url)),
        isDelete: 0,
        isReply: message.reference ? 1 : 0,
        replyToMessageId: message.reference ? message.reference.messageId : null,
    });
});

global.client.on('voiceStateUpdate', async (oldState, newState) => {
    if (!oldState.channelId && newState.channelId) {
        global.Database.addVoiceStateUpdate({
            userId: newState.id,
            oldChannelId: null,
            newChannelId: newState.channelId,
            datetime: Date.now(),
            executorId: newState.member.id,
            oldServerDeaf: oldState.serverDeaf,
            newServerDeaf:newState.serverDeaf,
            oldServerMute:oldState.serverMute,
            newServerMute:newState.serverMute,
            oldClientMute:oldState.selfMute,
            newClientMute:newState.selfMute,
            oldClientDeaf:oldState.selfDeaf,
            newClientDeaf:newState.selfMute,
            oldStream:oldState.streaming,
            newStream: newState.streaming,
            oldCam:oldState.selfVideo,
            newCam:newState.selfVideo,
            eventType: 1

        });
    } else if (oldState.channelId && !newState.channelId) {
        const executorId = await getAuditExecutor(oldState.guild, 27, oldState.id);

        global.Database.addVoiceStateUpdate({
            userId: oldState.id,
            oldChannelId: oldState.channelId,
            newChannelId: null,
            datetime: Date.now(),
            executorId: executorId,
            oldServerDeaf: oldState.serverDeaf,
            newServerDeaf:newState.serverDeaf,
            oldServerMute:oldState.serverMute,
            newServerMute:newState.serverMute,
            oldClientMute:oldState.selfMute,
            newClientMute:newState.selfMute,
            oldClientDeaf:oldState.selfDeaf,
            newClientDeaf:newState.selfMute,
            oldStream:oldState.streaming,
            newStream: newState.streaming,
            oldCam:oldState.selfVideo,
            newCam:newState.selfVideo,
            eventType: 3

        });
    } else if (oldState.channelId !== newState.channelId) {
        const executorId = await getAuditExecutor(oldState.guild, 26, oldState.id);

        global.Database.addVoiceStateUpdate({
            userId: oldState.id,
            oldChannelId: oldState.channelId,
            newChannelId: newState.channelId,
            datetime: Date.now(),
            executorId: executorId || oldState.member.id,
            oldServerDeaf: oldState.serverDeaf,
            newServerDeaf:newState.serverDeaf,
            oldServerMute:oldState.serverMute,
            newServerMute:newState.serverMute,
            oldClientMute:oldState.selfMute,
            newClientMute:newState.selfMute,
            oldClientDeaf:oldState.selfDeaf,
            newClientDeaf:newState.selfMute,
            oldStream:oldState.streaming,
            newStream: newState.streaming,
            oldCam:oldState.selfVideo,
            newCam:newState.selfVideo,
            eventType: 2
        });
    } else if (oldState.serverDeaf !== newState.serverDeaf || oldState.serverMute !== newState.serverMute || oldState.selfMute !== newState.selfMute || oldState.selfDeaf !== newState.selfDeaf || oldState.streaming !== newState.streaming || oldState.selfVideo !== newState.selfVideo) {
        const executorId = await getAuditExecutor(oldState.guild, 24, oldState.id);

        global.Database.addVoiceStateUpdate({
            userId: oldState.id,
            oldChannelId: oldState.channelId,
            newChannelId: newState.channelId,
            datetime: Date.now(),
            executorId: executorId || oldState.member.id,
            oldServerDeaf: oldState.serverDeaf,
            newServerDeaf:newState.serverDeaf,
            oldServerMute:oldState.serverMute,
            newServerMute:newState.serverMute,
            oldClientMute:oldState.selfMute,
            newClientMute:newState.selfMute,
            oldClientDeaf:oldState.selfDeaf,
            newClientDeaf:newState.selfMute,
            oldStream:oldState.streaming,
            newStream: newState.streaming,
            oldCam:oldState.selfVideo,
            newCam:newState.selfVideo,
            eventType: 4
        }); 
    }
});

global.client.on('interactionCreate', interaction => {
    global.Database.addInteractionCreate({
        type: interaction.type,
        datetime: Date.now(),
        commandName: interaction.commandName,
        executorId: interaction.user.id,
        channelid: interaction.channelId,
    });
});

global.client.on('guildBanAdd', async ban => {
    const executorId = await getAuditExecutor(ban.guild, 22, ban.user.id);
    global.Database.addGuidBanAdd({
        userid: ban.user.id,
        reason: ban.reason || 'Not specified',
        datetime: Date.now(),
        executorId: executorId,
    });
});

global.client.on('inviteCreate',async invite => {
    const executorId = await getAuditExecutor(invite.guild, 40, invite.code);

    global.Database.addInviteCreate({
        userid: invite.inviter ? invite.inviter.id : null,
        code: invite.code,
        channelid: invite.channel.id,
        maxUses: invite.maxUses,
        expiresAt: invite.expiresTimestamp,
        executorId: executorId
    });
});

global.client.on('inviteDelete', async invite => {
    const executorId = await getAuditExecutor(invite.guild, 42, invite.code);
    global.Database.addInviteDelete({
        code: invite.code,
        channelid: invite.channel.id,
        executorId: executorId,
    });
});

global.client.on('messageUpdate', (oldMessage, newMessage) => {
    global.Database.addMessageUpdate({
        userId: newMessage.author.id,
        messageId: newMessage.id,
        newContent: newMessage.content,
        oldContent: oldMessage.content,
        datetime: Date.now(),
    });
});

global.client.on('roleCreate', async role => {
    const executorId = await getAuditExecutor(role.guild, 30, role.id);
    global.Database.addRoleCreate({
        roleId: role.id,
        name: role.name,
        color: role.hexColor,
        permissions: role.permissions,
        datetime: Date.now(),
        executorId: executorId,
    });
});

global.client.on('roleDelete', async role => {
    const executorId = await getAuditExecutor(role.guild, 32, role.id);
    global.Database.addRoleUpdate({
        roleId: role.id,
        name: role.name,
        datetime: Date.now(),
        isDelete: true,
        executorId: executorId,
    });
});

global.client.on('roleUpdate', async (oldRole, newRole) => {
    const executorId = await getAuditExecutor(newRole.guild, 31, newRole.id);
    global.Database.addRoleUpdate({
        roleId: newRole.id,
        name: newRole.name,
        datetime: Date.now(),
        executorId: executorId,
    });
});

global.client.on('messageDelete', async message => {
    const executorId = await getAuditExecutor(message.guild, 72, message.id);
    global.Database.addMessageDelete({
        messageId: message.id,
        datetime: Date.now(),
        executorId: executorId,
    });
});

global.client.on('channelCreate', async channel => {
    const executorId = await getAuditExecutor(channel.guild, 10, channel.id);
    global.Database.addChannelCreate({
        channelId: channel.id,
        name: channel.name,
        permissions: channel.permissionOverwrites.cache,
        datetime: Date.now(),
        executorId: executorId,
    });
});

global.client.on('channelDelete', async channel => {
    const executorId = await getAuditExecutor(channel.guild, 12, channel.id);
    global.Database.addChannelDelete({
        channelId: channel.id,
        name: channel.name,
        permissions: channel.permissionOverwrites.cache,
        datetime: Date.now(),
        isDelete: true,
        executorId: executorId,
    });
});

global.client.on('channelUpdate', async (oldChannel, newChannel) => {
    const executorId = await getAuditExecutor(newChannel.guild,11, newChannel.id);
    global.Database.addChannelUpdate({
        channelId: newChannel.id,
        oldName: oldChannel.name,
        newName: newChannel.name,
        oldPermissions: oldChannel.permissionOverwrites.cache,
        newPermissions: newChannel.permissionOverwrites.cache,
        datetime: Date.now(),
        executorId: executorId,
    });
});

global.client.on('guildBanRemove', async ban => {
    const executorId = await getAuditExecutor(ban.guild,23, ban.user.id);
    global.Database.addGuidBanAdd({
        userid: ban.user.id,
        datetime: Date.now(),
        isDelete: true,
        executorId: executorId,
    });
});

global.client.on('emojiCreate', async emoji => {
    const executorId = await getAuditExecutor(emoji.guild, 60, emoji.id);
    global.Database.addEmojiCreate({
        emojiId: emoji.id,
        emojiPath: emoji.url,
        datetime: Date.now(),
        executorId: executorId,
    });
});

global.client.on('emojiDelete', async emoji => {
    const executorId = await getAuditExecutor(emoji.guild, 62, emoji.id);
    global.Database.addEmojiUpdate({
        emojiId: emoji.id,
        datetime: Date.now(),
        isDelete: true,
        executorId: executorId,
    });
});

global.client.on('emojiUpdate', async (oldEmoji, newEmoji) => {
    const executorId = await getAuditExecutor(newEmoji.guild, 61, newEmoji.id);
    global.Database.addEmojiUpdate({
        emojiId: newEmoji.id,
        oldEmojiPath: oldEmoji.url,
        newEmojiPath: newEmoji.url,
        datetime: Date.now(),
        executorId: executorId,
    });
});

global.client.on('messageReactionAdd', (reaction, user) => {
    global.Database.addMessageReactionAdd({
        reactionId: reaction.emoji.id,
        messageId: reaction.message.id,
        userId: user.id,
        datetime: Date.now(),
    });
});

global.client.on('messageReactionRemove', (reaction, user) => {
    global.Database.addMessageReactionRemove({
        reactionId: reaction.emoji.id,
        messageId: reaction.message.id,
        userId: user.id,
        datetime: Date.now(),
    });
});

global.client.on('messageDeleteBulk', async messages => {
    const executorId = await getAuditExecutor(messages.first().guild, 73, messages.first().channel.id);
    global.Database.addMessageDeleteBulk({
        channelId: messages.first().channel.id,
        deletedMessages: messages.size,
        datetime: Date.now(),
        executorId: executorId,
    });
});

global.client.on('threadCreate', async thread => {
    const executorId = await getAuditExecutor(thread.guild, 10, thread.id);
    global.Database.addChannelCreate({
        channelId: thread.id,
        name: thread.name,
        permissions: thread.permissionOverwrites.cache,
        datetime: Date.now(),
        executorId: executorId,
    });
});

global.client.on('threadDelete', async thread => {
    const executorId = await getAuditExecutor(thread.guild, 12, thread.id);
    global.Database.addChannelDelete({
        channelId: thread.id,
        name: thread.name,
        permissions: thread.permissionOverwrites.cache,
        datetime: Date.now(),
        isDelete: true,
        executorId: executorId,
    });
});

global.client.on('threadUpdate', async (oldThread, newThread) => {
    const executorId = await getAuditExecutor(newThread.guild, 11, newThread.id);
    global.Database.addChannelUpdate({
        channelId: newThread.id,
        oldName: oldThread.name,
        newName: newThread.name,
        datetime: Date.now(),
        executorId: executorId,
    });
});

global.client.on('stickerCreate', async sticker => {
    const executorId = await getAuditExecutor(sticker.guild, 90, sticker.id);
    global.Database.addEmojiCreate({
        emojiId: sticker.id,
        emojiPath: sticker.url,
        datetime: Date.now(),
        executorId: executorId,
    });
});

global.client.on('stickerDelete', async sticker => {
    const executorId = await getAuditExecutor(sticker.guild, 92, sticker.id);
    global.Database.addEmojiUpdate({
        emojiId: sticker.id,
        datetime: Date.now(),
        isDelete: true,
        executorId: executorId,
    });
});



// global.client.on('guildMemberAdd', member => {
//     logEvent('join', {
//         userid: member.id,
//         currentMember: global.guild.memberCount
//     });
// });

// global.client.on('guildMemberRemove', member => {
//     logEvent('left', {
//         userid: member.id,
//         currentMember: global.guild.memberCount
//     });
// });

// global.client.on('messageCreate', message => {
//     logEvent('message', {
//         userid: message.author.id,
//         messageid: message.id,
//         channelid: message.channel.id,
//     });
// });

// global.client.on('voiceStateUpdate', (oldState, newState) => {
//     if (!oldState.channelId && newState.channelId) {
//         logEvent('vocaljoin', {
//             userid: newState.id,
//             channelid: newState.channelId,
//         });
//     } else if (oldState.channelId && !newState.channelId) {
//         logEvent('vocalleft', {
//             userid: oldState.id,
//             channelid: oldState.channelId,
//         });
//     } else if (oldState.channelId !== newState.channelId) {
//         logEvent('vocalmove', {
//             userid: oldState.id,
//             old_channelid: oldState.channelId,
//             new_channelid: newState.channelId,
//         });
//     }
// });

// global.client.on('interactionCreate', interaction => {
//     logEvent('interaction', {
//         userid: interaction.user.id,
//         interactionname: interaction.commandName,
//         extras: interaction.options ? JSON.stringify(interaction.options.data) : '',
//     });
// });
// global.client.on('guildBanAdd', (ban) => {
//     logEvent('ban', {
//         userid: ban.user.id,
//         reason: ban.reason || 'Non spécifié',
//         exectutor: 'Unknown',
//     });
// });

// global.client.on('inviteCreate', (invite) => {
//     logEvent('invitcreate', {
//         userid: invite.inviter.id,
//         invitcode: invite.code,
//     });
// });

// global.client.on('inviteDelete', (invite) => {
//     logEvent('invitdelete', {
//         exectutor: 'Unknown',
//         invitcode: invite.code,
//     });
// });

// global.client.on('messageUpdate', (oldMessage, newMessage) => {
//     logEvent('messageupdate', {
//         userid: newMessage.author.id,
//         messageid: newMessage.id,
//     });
// });

// global.client.on('roleCreate', (role) => {
//     logEvent('rolecreate', {
//         exectutor: 'Unknown',
//         rolename: role.name,
//         roleid: role.id,
//     });
// });
// global.client.on('roleDelete', (role) => {
//     logEvent('roledelete', {
//         exectutor: 'Unknown',
//         rolename: role.name,
//         roleid: role.id,
//     });
// });

// global.client.on('roleUpdate', (oldRole, newRole) => {
//     logEvent('roleedit', {
//         exectutor: 'Unknown',
//         rolename: newRole.name,
//         roleid: newRole.id,
//     });
// });
// global.client.on('messageDelete', (message) => {
//     logEvent('messagedelete', {
//         executor: 'Unknown',
//         messageid: message.id,
//         channelid: message.channel.id,
//     });
// });
// global.client.on('channelCreate', (channel) => {
//     logEvent('channelcreate', {
//         exectutor: 'Unknown',
//         channelname: channel.name,
//         channelid: channel.id,
//     });
// });
// global.client.on('channelDelete', (channel) => {
//     logEvent('channeldelete', {
//         exectutor: 'Unknown',
//         channelname: channel.name,
//         channelid: channel.id,
//     });
// });
// global.client.on('channelUpdate', (oldChannel, newChannel) => {
//     logEvent('channeledit', {
//         exectutor: 'Unknown',
//         channelname: newChannel.name,
//         channelid: newChannel.id,
//     });
// });
// global.client.on('guildBanRemove', (ban) => {
//     logEvent('banremove', {
//         userid: ban.user.id,
//         exectutor: 'Unknown',
//     });
// });
// global.client.on('emojiCreate', (emoji) => {
//     logEvent('emojicreate', {
//         userid: 'Unknown',
//         emojiid: emoji.id,
//     });
// });
// global.client.on('emojiDelete', (emoji) => {
//     logEvent('emojidelete', {
//         exectutor: 'Unknown',
//         emojiid: emoji.id,
//     });
// });
// global.client.on('emojiUpdate', (oldEmoji, newEmoji) => {
//     logEvent('emojiupdate', {
//         exectutor: 'Unknown',
//         emojid: newEmoji.id,
//     });
// });
// global.client.on('messageReactionAdd', (reaction, user) => {
//     logEvent('messagereactionadd', {
//         userid: user.id,
//         messageid: reaction.message.id,
//         channelid: reaction.message.channel.id,
//     });
// });
// global.client.on('messageReactionRemove', (reaction, user) => {
//     logEvent('messagereactionremove', {
//         userid: user.id,
//         messageid: reaction.message.id,
//         channelid: reaction.message.channel.id,
//     });
// });
// global.client.on('messageDeleteBulk', (messages) => {
//     logEvent('messagebulkdelete', {
//         exectutor: 'Unknown',
//         channelid: messages.first().channel.id,
//     });
// });
// global.client.on('threadCreate', (thread) => {
//     logEvent('threadcreate', {
//         userid: thread.ownerId,
//         threadid: thread.id,
//         channelid: thread.parentId,
//     });
// });
// global.client.on('threadDelete', (thread) => {
//     logEvent('threaddelete', {
//         exectutor: 'Unknown',
//         threadid: thread.id,
//         channelid: thread.parentId,
//     });
// });

// global.client.on('threadUpdate', (oldThread, newThread) => {
//     logEvent('threadupdate', {
//         exectutor: 'Unknown',
//         threadid: newThread.id,
//         channelid: newThread.parentId,
//     });
// });
// global.client.on('stickerCreate', (sticker) => {
//     logEvent('stickercreate', {
//         userid: 'Unknown',
//         stickerid: sticker.id,
//     });
// });
// global.client.on('stickerDelete', (sticker) => {
//     logEvent('stickerdelete', {
//         exectutor: 'Unknown',
//         stickerid: sticker.id,
//     });
// });
// global.client.on('stickerUpdate', (oldSticker, newSticker) => {
//     logEvent('stickerupdate', {
//         exectutor: 'Unknown',
//         stickerid: newSticker.id,
//     });
// });
