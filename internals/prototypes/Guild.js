'use strict';
const { Guild } = require('discord.js');

Guild.prototype.fetchAllAuditLogs = async function () {
    let lastId = null;
    let fetchedAuditLogs = [];
    const r = [];
    do {
        fetchedAuditLogs = Array.from((await this.fetchAuditLogs({ limit: 100, before: lastId })).entries);
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

Guild.prototype.latestAuditLog = async function () {
    const fetchedAuditLogs = Array.from((await this.fetchAuditLogs({ limit: 1 })).entries);
    return fetchedAuditLogs[0][1] || null;
};

Guild.prototype.channelTypeStr = function (channelType) {
    switch (channelType) {
        case 0:
            return 'text';
        case 2:
            return 'voice';
        case 15:
            return 'forum';
        default:
            // TODO: add all channel type
            return 'who cares';
    }
};

module.exports = {};