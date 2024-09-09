//@ts-check
'use strict';
require('puparia.getlines.js');
const reportEvent = Events.createReportEvent(__filename);

const event = Events.GuildRoleDelete;
let eventName = String(event);

global.client.on(event, async (role) => {
    if (global.guild.id !== role.guild.id) return;

    try {
        const latestAuditLog = await global.guild.latestAuditLog();
        reportEvent(__line, eventName, 'author.name', latestAuditLog?.executor.tag, 'role.name', role.name);
    } catch (err) {
        console.error(`${__filename} - Line ${__line} (${eventName}): `, err);
    }
});

module.exports = {};
