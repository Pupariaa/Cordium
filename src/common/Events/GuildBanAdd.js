//@ts-check
'use strict';
require('puparia.getlines.js');
const reportEvent = Events.createReportEvent(__filename);

const event = Events.GuildBanAdd;

global.client.on(event, async (ban) => {
    if (global.guild.id !== ban.guild.id) return;
    let eventName = String(event);

    try {
        const latestAuditLog = await global.guild.latestAuditLog();
        reportEvent(__line, eventName, 'author.name', latestAuditLog?.executor.tag, 'user.name', ban.user.tag, 'reason', ban.reason, 'partial', ban.partial);
    } catch (err) {
        console.error(`${__filename} - Line ${__line} (${eventName}): `, err);
    }
});

module.exports = {};
