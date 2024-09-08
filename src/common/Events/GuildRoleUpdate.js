//@ts-check
'use strict';
require('puparia.getlines.js');
const reportEvent = Events.createReportEvent(__filename);

const event = Events.GuildRoleUpdate;

global.client.on(event, async (oldRole, newRole) => {
    if (global.guild.id !== oldRole.guild.id) return;
    let eventName = String(event);

    try {
        if (JSON.stringify(oldRole) === JSON.stringify(newRole)) return;
        const latestAuditLog = await global.guild.latestAuditLog();
        reportEvent(__line, eventName, 'author.name', latestAuditLog?.executor.tag, 'role.name', oldRole.name, '->', newRole.name, 'role.color', oldRole.hexColor, '->', newRole.hexColor);
    } catch (err) {
        console.error(`${__filename} - Line ${__line} (${eventName}): `, err);
    }
});



module.exports = {};
