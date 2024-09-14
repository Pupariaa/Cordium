'use strict';
const { TextChannel } = require('discord.js');

TextChannel.prototype.fetchAllMessages = function (...args) { return global.channels.fetchAllMessages.call(this, ...args); }

TextChannel.prototype.hasTag = function (tag) {
    this._hasTag(global.channels.text, tag);
};

module.exports = {};