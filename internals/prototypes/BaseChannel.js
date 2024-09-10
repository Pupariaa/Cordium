'use strict';
const { BaseChannel } = require('discord.js');

BaseChannel.prototype.getMembers = async function () {
    return Array.from(this.members.values());
};

BaseChannel.prototype._hasTag = function (channels, tag) {
    return channels.getByTags(tag).map(channel => channel.id).includes(this.id);
};

module.exports = {};