'use strict';
const { TextChannel } = require('discord.js');

TextChannel.prototype.fetchAllMessages = async function () {
    const functionName = 'fetchAllMessages';
    try {
        let lastId = null;
        let fetchedMessages = [];
        const r = [];
        do {
            fetchedMessages = Array.from((await this.messages.fetch({ limit: 100, before: lastId })).values());
            if (fetchedMessages.length === 0) {
                break;
            }
            fetchedMessages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
            lastId = fetchedMessages[0].id;
            for (let i = fetchedMessages.length - 1; i >= 0; i--) {
                r.unshift(fetchedMessages[i]);
            }
        } while (fetchedMessages.length === 100);
        return r;
    } catch (err) {
        console.error(`${functionName}: ${err}`);
    }
};

TextChannel.prototype.hasTag = function (tag) {
    this._hasTag(global.channels.forum, tag);
};

module.exports = {};