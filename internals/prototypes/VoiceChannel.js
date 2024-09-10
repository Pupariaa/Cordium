'use strict';
const { VoiceChannel } = require('discord.js');

VoiceChannel.prototype.hasTag = function (tag) {
    this._hasTag(global.channels.forum, tag);
};

module.exports = {};