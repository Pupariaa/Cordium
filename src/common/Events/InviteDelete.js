//@ts-check
'use strict';
require('puparia.getlines.js');
const reportEvent = Events.createReportEvent(__filename);

const event = Events.InviteDelete;
let eventName = String(event);

global.client.on(event, async (invite) => {
    if (global.guild.id !== invite.guild.id) return;

    try {
        const latestAuditLog = await global.guild.latestAuditLog();
        reportEvent(__line, eventName, 'author.name', latestAuditLog?.executor.tag, 'url', invite.url);
    } catch (err) {
        console.error(`${__filename} - Line ${__line} (${eventName}): `, err);
    }
});

module.exports = {};
