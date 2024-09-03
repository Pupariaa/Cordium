const { Collection, Client } = require('discord.js');

Client.prototype.fetchGuildsInfo = function() {
    return this.guilds.cache.map(guild => ({
        name: guild.name,
        id: guild.id,
        channels: guild.channels.cache.map(channel => ({
            name: channel.name,
            id: channel.id,
            type: channel.type,
        })),
    }));
};
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
    return this.guilds.cache.map(guild => guild.channels.cache.find(channel => channel.name === channelName)).filter(Boolean)[0] || null;
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
    for (const guild of this.guilds.cache.values()) {
        const defaultChannel = guild.channels.cache.find(channel => channel.isText() && channel.permissionsFor(guild.me).has('SEND_MESSAGES'));
        if (defaultChannel) {
            await defaultChannel.send(message);
        }
    }
};
Client.prototype.getUserByUsername = async function(username) {
    for (const guild of this.guilds.cache.values()) {
        const member = guild.members.cache.find(member => member.user.username === username);
        if (member) {
            return member.user;
        }
    }
    return null;
};
Client.prototype.fetchGuildsInfo = function() {
    return this.guilds.cache.map(guild => ({
        name: guild.name,
        id: guild.id,
        channels: guild.channels.cache.map(channel => ({
            name: channel.name,
            id: channel.id,
            type: channel.type,
        })),
    }));
};
Client.prototype.getMemberById = function(userId) {
    for (const guild of this.guilds.cache.values()) {
        const member = guild.members.cache.get(userId);
        if (member) {
            return member;
        }
    }
    return null;
};
Client.prototype.rateLimitCheck = function() {
    this.on('rateLimit', info => {
        global.client.warning(`Rate limit hit! Timeout: ${info.timeout}, Limit: ${info.limit}, Method: ${info.method}, Path: ${info.path}`);
    });
};