//@ts-check
'use strict';
require('puparia.getlines.js');
const reportEvent = Events.createReportEvent(__filename);

const event = Events.ChannelUpdate;
let eventName = String(event);

global.client.on(event, async (oldChannel, newChannel) => {
    if (global.guild.id !== newChannel.guild.id) return;

    try {
        const latestAuditLog = await global.guild.latestAuditLog();
        reportEvent(__line, eventName, 'author.name', latestAuditLog?.executor.tag, 'channel.type', global.guild.channelTypeStr(oldChannel.type), 'old.channel.name', oldChannel.nam, '->', newChannel.name);
    } catch (err) {
        console.error(`${__filename} - Line ${__line} (${eventName}): `, err);
    }
});

module.exports = {};
