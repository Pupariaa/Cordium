//@ts-check
'use strict';
require('puparia.getlines.js');
const reportEvent = Events.createReportEvent(__filename);

const event = Events.GuildMemberRemove;
let eventName = String(event);

const { AuditLogEvent } = require('discord.js');

global.client.on(event, async (member) => {
    if (global.guild.id !== member.guild.id) return;

    try {
        const latestAuditLog = await global.guild.latestAuditLog();
        if (latestAuditLog?.action === AuditLogEvent.GuildBanAdd && latestAuditLog?.target.id === member.id) return;
        reportEvent(__line, eventName, 'user.name', member.user.tag);
    } catch (err) {
        console.error(`${__filename} - Line ${__line} (${eventName}): `, err);
    }
});

module.exports = {};
