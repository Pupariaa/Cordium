'use strict';
const { TextChannel } = require('discord.js');
const { __cfn, __cf } = eval(require(`current_filename`));
const { report, reportWarn, reportError } = console.createReports(__cf);

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
        reportError(__line, functionName, err);
    }
};

TextChannel.prototype.hasTag = function (tag) {
    this._hasTag(global.channels.forum, tag);
};

module.exports = {};