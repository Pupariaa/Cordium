'use strict';
const { TextChannel } = require('discord.js');
const { __cfn, __cf } = eval(require(`current_filename`));
const { report, reportWarn, reportError } = console.createReports(__cfn);

TextChannel.prototype.fetchAllMessages = async function (
    applyToAll = TextChannel.prototype.fetchAllMessages.sort,
    applyToEvery = (message, r) => r.unshift(message)) {
    
    const functionName = 'fetchAllMessages';
    let lastId = null;
    const r = [];
    try {
        let fetchedMessages = [];
        do {
            fetchedMessages.length = 0;
            fetchedMessages = Array.from((await this.messages.fetch({ limit: 100, before: lastId })).values());
            if (fetchedMessages.length === 0) break;
            lastId = applyToAll(fetchedMessages, r);
            for (let i = fetchedMessages.length - 1; i >= 0; i--) applyToEvery(fetchedMessages[i], r);
        } while (fetchedMessages.length === 100);
    } catch (err) {
        reportError(__line, functionName, err);
    }
    return r;
};

TextChannel.prototype.fetchAllMessages.sort = (messages, r) => {
    messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
    return messages[0].id;
};

TextChannel.prototype.fetchAllMessages.scan = (messages, r) => {
    let lastId = messages[0].id;
    let lastCreatedTimestamp = messages[0].createdTimestamp;
    for (let i = messages.length - 1; i >= 1; i--) {
        const message = messages[i];
        if (message.createdTimestamp < lastCreatedTimestamp) {
            lastId = message.id;
            lastCreatedTimestamp = message.createdTimestamp;
        }
    }
    return lastId;
};

TextChannel.prototype.hasTag = function (tag) {
    this._hasTag(global.channels.forum, tag);
};

module.exports = {};