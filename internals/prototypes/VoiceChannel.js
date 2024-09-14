'use strict';
const { VoiceChannel } = require('discord.js');

VoiceChannel.prototype.fetchAllMessages = function (...args) { return global.channels.fetchAllMessages.call(this, ...args); }

VoiceChannel.prototype.hasTag = function (tag) {
    this._hasTag(global.channels.voice, tag);
};

module.exports = {};