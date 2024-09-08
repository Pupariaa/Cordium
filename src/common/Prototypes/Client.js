'use strict';
const { Client, Collection } = require('discord.js');

Client.prototype.registerCommand = function(commandName, callback) {
    if (!this.commands) {
        this.commands = new Collection();
    }
    this.commands.set(commandName, callback);
};

Client.prototype.executeCommand = function(commandName, message, args) {
    if (this.commands && this.commands.has(commandName)) {
        this.commands.get(commandName)(message, args);
    } else {
        message.reply('Command not found.');
    }
};

Client.prototype.findChannelByName = function(channelName) {
    return global.guild.channels.cache.find(channel => channel.name === channelName) || null;
};

Client.prototype.findChannelById = function(channelId) {
    const diff = 19 - String(channelId).length;
    if (diff > 0) {
        channelId = '0'.repeat(diff) + String(channelId);
        return global.guild.channels.cache.find(channel => String(channel.id) === channelId) || null;
    }
    return global.guild.channels.cache.find(channel => channel.id === channelId) || null;
};

Client.prototype.findChannel = function(channelRep) {
    return typeof channelRep === 'string' ? global.client.findChannelByName(channelRep) : global.client.findChannelById(channelRep);
};

Client.prototype.sendMessageToChannel = async function(channelName, message) {
    const channel = this.findChannelByName(channelName);
    if (channel) {
        await channel.send(message);
    } else {
        console.error(`Channel "${channelName}" not found.`);
    }
};

Client.prototype.broadcastMessage = async function(message) {
    const defaultChannel = global.guild.channels.cache.find(channel => channel.isText() && channel.permissionsFor(global.guild.me).has('SEND_MESSAGES'));
    if (defaultChannel) {
        await defaultChannel.send(message);
    }
};
Client.prototype.getUserByUsername = async function(username) {
    const member = global.guild.members.cache.find(member => member.user.username === username);
    return member ? member.user : null;
};

Client.prototype.getMemberById = function(userId) {
    return global.guild.members.cache.get(userId);
};

Client.prototype.rateLimitCheck = function() {
    this.on('rateLimit', info => {
        global.client.warning(`Rate limit hit! Timeout: ${info.timeout}, Limit: ${info.limit}, Method: ${info.method}, Path: ${info.path}`);
    });
};

Client.prototype.getMemberCount = function(includeBots = false) {
    this.on('guildCreate', () => {
        updateMemberCount(includeBots);
    });

    this.on('guildMemberAdd', () => {
        updateMemberCount(includeBots);
    });

    this.on('guildMemberRemove', () => {
        updateMemberCount(includeBots);
    });

    function updateMemberCount(includeBots) {
        const members = global.guild.members.cache;
        this.memberCount = includeBots
            ? members.size
            : members.filter(member => !member.user.bot).size;
    }

    return this.memberCount;
};