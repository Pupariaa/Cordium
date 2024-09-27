'use strict';
const { ThreadChannel } = require('discord.js');

ThreadChannel.prototype.fetchAllMessages = function (...args) {
	return global.channels.fetchAllMessages.call(this, ...args);
};

ThreadChannel.prototype.hasTag = function (tag) {
	this._hasTag(global.channels.text, tag);
};

module.exports = {};