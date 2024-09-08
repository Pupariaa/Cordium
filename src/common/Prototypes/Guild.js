'use strict';
const { Guild, AuditLogEvent } = require('discord.js');

Guild.prototype.fetchAllAuditLogs = async function() {
    let lastId = null;
    let fetchedAuditLogs = [];
    const r = [];
    do {
        fetchedAuditLogs = Array.from((await this.fetchAuditLogs({ limit: 100, before: lastId })).entries);
        console.log(fetchedAuditLogs.length);
        if (fetchedAuditLogs.length === 0) {
            break;
        }
        fetchedAuditLogs.sort((a, b) => a[1].createdTimestamp - b[1].createdTimestamp);
        lastId = fetchedAuditLogs[0][1].id;
        for (let i = fetchedAuditLogs.length - 1; i >= 0; i--) {
            r.unshift(fetchedAuditLogs[i][1]);
        }
    } while (fetchedAuditLogs.length === 100);
    return r;
};

/**
 * Gets the latest audit log entry for this guild.
 * @returns {AuditLogEntry | null} The latest audit log entry, or null if none exist.
 */
Guild.prototype.latestAuditLog = async function() {
    const fetchedAuditLogs = Array.from((await this.fetchAuditLogs({ limit: 1 })).entries);
    return fetchedAuditLogs[0][1] || null;
};

Guild.prototype.channelTypeStr = function(channelType) {
    switch (channelType) {
        case 0:
            return 'text';
        case 2:
            return 'voice';
        case 15:
            return 'forum';
        default:
            return 'who cares';
    }
}