//@ts-check
'use strict';
require('puparia.getlines.js');
const reportEvent = Events.createReportEvent(__filename);

const event = Events.ChannelCreate;

global.client.on(event, async (channel) => {
    if (global.guild.id !== channel.guild.id) return;
    let eventName = String(event);
    
    try {
        const latestAuditLog = await global.guild.latestAuditLog();
        reportEvent(__line, eventName, 'author.name', latestAuditLog?.executor.tag, 'channel.type', global.guild.channelTypeStr(channel.type), 'channel.name', channel.name);
    } catch (err) {
        console.error(`${__filename} - Line ${__line} (${eventName}): `, err);
    }
});

module.exports = {};
