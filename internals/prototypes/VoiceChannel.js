'use strict';
const { VoiceChannel } = require('discord.js');

VoiceChannel.prototype.getMembers = async function (channel) {
    if (!channel) return null;
    return Array.from(channel.members.values());
};

module.exports = {};