'use strict';
const fs = require('fs');
const path = require('path');

const eventsFile = path.join(__dirname, 'events.json');
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



global.client.on('guildMemberAdd', member => {
    logEvent('join', {
        userid: member.id,
        currentMember: global.guild.memberCount
    });
});

global.client.on('guildMemberRemove', member => {
    logEvent('left', {
        userid: member.id,
        currentMember: global.guild.memberCount
    });
});

global.client.on('messageCreate', message => {
    logEvent('message', {
        userid: message.author.id,
        messageid: message.id,
        channelid: message.channel.id,
    });
});

global.client.on('voiceStateUpdate', (oldState, newState) => {
    if (!oldState.channelId && newState.channelId) {
        logEvent('vocaljoin', {
            userid: newState.id,
            channelid: newState.channelId,
        });
    } else if (oldState.channelId && !newState.channelId) {
        logEvent('vocalleft', {
            userid: oldState.id,
            channelid: oldState.channelId,
        });
    } else if (oldState.channelId !== newState.channelId) {
        logEvent('vocalmove', {
            userid: oldState.id,
            old_channelid: oldState.channelId,
            new_channelid: newState.channelId,
        });
    }
});

global.client.on('interactionCreate', interaction => {
    logEvent('interaction', {
        userid: interaction.user.id,
        interactionname: interaction.commandName,
        extras: interaction.options ? JSON.stringify(interaction.options.data) : '',
    });
});
global.client.on('guildBanAdd', (ban) => {
    logEvent('ban', {
        userid: ban.user.id,
        reason: ban.reason || 'Non spécifié',
        exectutor: 'Unknown',
    });
});

global.client.on('inviteCreate', (invite) => {
    logEvent('invitcreate', {
        userid: invite.inviter.id,
        invitcode: invite.code,
    });
});

global.client.on('inviteDelete', (invite) => {
    logEvent('invitdelete', {
        exectutor: 'Unknown', 
        invitcode: invite.code,
    });
});

global.client.on('messageUpdate', (oldMessage, newMessage) => {
    logEvent('messageupdate', {
        userid: newMessage.author.id,
        messageid: newMessage.id,
    });
});

global.client.on('roleCreate', (role) => {
    logEvent('rolecreate', {
        exectutor: 'Unknown',
        rolename: role.name,
        roleid: role.id,
    });
});
global.client.on('roleDelete', (role) => {
    logEvent('roledelete', {
        exectutor: 'Unknown',
        rolename: role.name,
        roleid: role.id,
    });
});

global.client.on('roleUpdate', (oldRole, newRole) => {
    logEvent('roleedit', {
        exectutor: 'Unknown',
        rolename: newRole.name,
        roleid: newRole.id,
    });
});
global.client.on('messageDelete', (message) => {
    logEvent('messagedelete', {
        executor: 'Unknown',
        messageid: message.id,
        channelid: message.channel.id,
    });
});
global.client.on('channelCreate', (channel) => {
    logEvent('channelcreate', {
        exectutor: 'Unknown',
        channelname: channel.name,
        channelid: channel.id,
    });
});
global.client.on('channelDelete', (channel) => {
    logEvent('channeldelete', {
        exectutor: 'Unknown',
        channelname: channel.name,
        channelid: channel.id,
    });
});
global.client.on('channelUpdate', (oldChannel, newChannel) => {
    logEvent('channeledit', {
        exectutor: 'Unknown',
        channelname: newChannel.name,
        channelid: newChannel.id,
    });
});
global.client.on('guildBanRemove', (ban) => {
    logEvent('banremove', {
        userid: ban.user.id,
        exectutor: 'Unknown',
    });
});
global.client.on('emojiCreate', (emoji) => {
    logEvent('emojicreate', {
        userid: 'Unknown',
        emojiid: emoji.id,
    });
});
global.client.on('emojiDelete', (emoji) => {
    logEvent('emojidelete', {
        exectutor: 'Unknown',
        emojiid: emoji.id,
    });
});
global.client.on('emojiUpdate', (oldEmoji, newEmoji) => {
    logEvent('emojiupdate', {
        exectutor: 'Unknown',
        emojid: newEmoji.id,
    });
});
global.client.on('messageReactionAdd', (reaction, user) => {
    logEvent('messagereactionadd', {
        userid: user.id,
        messageid: reaction.message.id,
        channelid: reaction.message.channel.id,
    });
});
global.client.on('messageReactionRemove', (reaction, user) => {
    logEvent('messagereactionremove', {
        userid: user.id,
        messageid: reaction.message.id,
        channelid: reaction.message.channel.id,
    });
});
global.client.on('messageDeleteBulk', (messages) => {
    logEvent('messagebulkdelete', {
        exectutor: 'Unknown',
        channelid: messages.first().channel.id,
    });
});
global.client.on('threadCreate', (thread) => {
    logEvent('threadcreate', {
        userid: thread.ownerId,
        threadid: thread.id,
        channelid: thread.parentId,
    });
});
global.client.on('threadDelete', (thread) => {
    logEvent('threaddelete', {
        exectutor: 'Unknown',
        threadid: thread.id,
        channelid: thread.parentId,
    });
});

global.client.on('threadUpdate', (oldThread, newThread) => {
    logEvent('threadupdate', {
        exectutor: 'Unknown',
        threadid: newThread.id,
        channelid: newThread.parentId,
    });
});
global.client.on('stickerCreate', (sticker) => {
    logEvent('stickercreate', {
        userid: 'Unknown',
        stickerid: sticker.id,
    });
});
global.client.on('stickerDelete', (sticker) => {
    logEvent('stickerdelete', {
        exectutor: 'Unknown',
        stickerid: sticker.id,
    });
});
global.client.on('stickerUpdate', (oldSticker, newSticker) => {
    logEvent('stickerupdate', {
        exectutor: 'Unknown',
        stickerid: newSticker.id,
    });
});
