'use strict';
const { BaseChannel } = require('discord.js');

BaseChannel.prototype.getMembers = async function () {
    return Array.from(this.members.values());
};

BaseChannel.prototype._hasTag = function (channels, tag) {
    return channels.getByTags(tag).map(channel => channel.id).includes(this.id);
};

// async getCreator(channel) {
//     const functionName = 'getCreator';
//     try {
//         let auditLogs = await global.guild.fetchAllAuditLogs();
//         if (!auditLogs) return null;
//         for (const entry of auditLogs) {
//             if (entry.action === AuditLogEvent.ChannelCreate && entry.target.id === channel.id) {
//                 return entry.executor;
//             }
//         }
//     } catch (err) {
//         reportError(__line, functionName, `Error fetching audit logs:`, err);
//     }
//     return null;
// }

module.exports = {};