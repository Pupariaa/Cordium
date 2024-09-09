//@ts-check
'use strict';
require('puparia.getlines.js');
const reportEvent = Events.createReportEvent(__filename);

const event = Events.MessageDelete;
let eventName = String(event);

global.client.on(event, async (message) => {
    if (global.guild.id !== message.guild.id) return;

    try {
        if (message.partial) {
            eventName += '.partial';
        }
        const latestAuditLog = await global.guild.latestAuditLog();
        reportEvent(__line, eventName, 'author.name', latestAuditLog?.executor.tag, 'target.name', message.author.tag,'channel.name', message.channel.name, 'content', message.content);
    } catch (err) {
        console.error(`${__filename} - Line ${__line} (${eventName}): `, err);
    }
});

module.exports = {};
