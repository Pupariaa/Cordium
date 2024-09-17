'use strict';
const { Client, Collection } = require('discord.js');

const { __cfn, __cf } = eval(require(`current_filename`));
const { report, reportWarn, reportError } = console.createReports(__cfn);

Client.prototype.registerCommand = function (commandName, callback) {
    if (!this.commands) {
        this.commands = new Collection();
    }
    this.commands.set(commandName, callback);
};

Client.prototype.executeCommand = function (commandName, message, args) {
    if (this.commands && this.commands.has(commandName)) {
        this.commands.get(commandName)(message, args);
    } else {
        message.reply('Command not found');
    }
};

Client.prototype.getChannelByName = function (channelName) {
    return global.guild.channels.cache.find(channel => channel.name === channelName) || null;
};

Client.prototype.getChannelById = function (channelId) {
    const diff = 19 - String(channelId).length;
    if (diff > 0) {
        channelId = '0'.repeat(diff) + String(channelId);
        return global.guild.channels.cache.find(channel => String(channel.id) === channelId) || null;
    }
    return global.guild.channels.cache.find(channel => channel.id === channelId) || null;
};

Client.prototype.findChannel = function (channelRep) {
    return typeof channelRep === 'string' ? global.client.getChannelByName(channelRep) : global.client.getChannelById(channelRep);
};

Client.prototype.sendMessageToChannel = async function (channelName, message) {
    const functionName = 'sendMessageToChannel';
    const channel = this.getChannelByName(channelName);
    if (channel) {
        await channel.send(message);
    } else {
        reportError(__line, functionName, `Channel "${channelName}" not found`);
    }
};

Client.prototype.broadcastMessage = async function (message) {
    const defaultChannel = global.guild.channels.cache.find(channel => channel.isText() && channel.permissionsFor(global.guild.me).has('SEND_MESSAGES'));
    if (defaultChannel) {
        await defaultChannel.send(message);
    }
};

Client.prototype.getUserByUsername = async function (username) {
    const member = global.guild.members.cache.find(member => member.user.username === username);
    return member ? member.user : null;
};

Client.prototype.getMemberById = function (id) {
    return global.guild.members.cache.get(id);
};

Client.prototype.rateLimitCheck = function () {
    this.on('rateLimit', info => {
        global.client.warning(`Rate limit hit! Timeout: ${info.timeout}, Limit: ${info.limit}, Method: ${info.method}, Path: ${info.path}`);
    });
};

Client.prototype.getMemberCount = function (includeBots = false) {
    this.on('guildCreate', () => updateMemberCount(includeBots));
    this.on('guildMemberAdd', () => updateMemberCount(includeBots));
    this.on('guildMemberRemove', () => updateMemberCount(includeBots));

    /**
     * Updates the member count of the client by filtering the guild members by bots
     * @param {boolean} includeBots - Whether to include bots in the count
     * @private
     */
    function updateMemberCount(includeBots) {
        const members = global.guild.members.cache;
        this.memberCount = includeBots
            ? members.size
            : members.filter(member => !member.user.bot).size;
    }

    return this.memberCount;
};

module.exports = {};