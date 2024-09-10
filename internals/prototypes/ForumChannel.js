'use strict';
const { ForumChannel } = require('discord.js');

ForumChannel.prototype.hasTag = function (tag) {
    this._hasTag(global.channels.forum, tag);
};

module.exports = {};