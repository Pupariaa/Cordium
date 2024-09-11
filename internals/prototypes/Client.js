'use strict';
const { Client, Collection } = require('discord.js');
const { __cfn, __cf } = eval(require(`current_filename`));
const { report, reportWarn, reportError } = console.createReports(__cf);

/**
 * Registers a command by name.
 * @param {string} commandName - The name of the command to register.
 * @param {function(Message, string[])} callback - The callback to execute when the command is triggered.
 */
Client.prototype.registerCommand = function (commandName, callback) {
    if (!this.commands) {
        this.commands = new Collection();
    }
    this.commands.set(commandName, callback);
};

/**
 * Executes a command by name.
 * @param {string} commandName - The name of the command to execute.
 * @param {Message} message - The message that triggered the command.
 * @param {string[]} args - The arguments to the command.
 */
Client.prototype.executeCommand = function (commandName, message, args) {
    if (this.commands && this.commands.has(commandName)) {
        this.commands.get(commandName)(message, args);
    } else {
        message.reply('Command not found');
    }
};

/**
 * Finds a channel by name.
 * @param {string} channelName The name of the channel to find.
 * @returns {Channel | null} The channel with the given name, or null if not found.
 */
Client.prototype.findChannelByName = function (channelName) {
    return global.guild.channels.cache.find(channel => channel.name === channelName) || null;
};

/**
 * Finds a channel by id. If the id is shorter than 19 characters, it will be padded with zeros on the left.
 * @param {string} channelId The id of the channel to find.
 * @returns {Channel | null} The channel with the given id, or null if not found.
 */
Client.prototype.findChannelById = function (channelId) {
    const diff = 19 - String(channelId).length;
    if (diff > 0) {
        channelId = '0'.repeat(diff) + String(channelId);
        return global.guild.channels.cache.find(channel => String(channel.id) === channelId) || null;
    }
    return global.guild.channels.cache.find(channel => channel.id === channelId) || null;
};

/**
 * Finds a channel by its name or ID.
 * @param {string|number} channelRep - The name or ID of the channel to find.
 * @returns {Channel|null} - The channel object, or null if it does not exist.
 */
Client.prototype.findChannel = function (channelRep) {
    return typeof channelRep === 'string' ? global.client.findChannelByName(channelRep) : global.client.findChannelById(channelRep);
};

/**
 * Send a message to a channel using its pseudoname.
 * @param {string} channelName - The name of the channel to send the message to.
 * @param {string|Object} message - The message data to be sent.
 * @returns {Promise<void>}
 */
Client.prototype.sendMessageToChannel = async function (channelName, message) {
    const functionName = 'sendMessageToChannel';
    const channel = this.findChannelByName(channelName);
    if (channel) {
        await channel.send(message);
    } else {
        reportError(__line, functionName, `Channel "${channelName}" not found`);
    }
};

/**
 * Sends a message to the default channel of the guild that the bot has SEND_MESSAGES permissions in.
 * @param {string} message - The message to send.
 * @returns {Promise<void>} - The promise of the message being sent.
 */
Client.prototype.broadcastMessage = async function (message) {
    const defaultChannel = global.guild.channels.cache.find(channel => channel.isText() && channel.permissionsFor(global.guild.me).has('SEND_MESSAGES'));
    if (defaultChannel) {
        await defaultChannel.send(message);
    }
};
/**
 * Retrieves a User object from the cache by their username.
 * @param {string} username - The username of the user to retrieve.
 * @returns {?User} - The User object if found, otherwise null.
 */
Client.prototype.getUserByUsername = async function (username) {
    const member = global.guild.members.cache.find(member => member.user.username === username);
    return member ? member.user : null;
};

/**
 * Retrieves a GuildMember object from the cache by their ID.
 * @param {string} userId - The ID of the user to retrieve.
 * @returns {?GuildMember} - The GuildMember object if found, otherwise null.
 */
Client.prototype.getMemberById = function (userId) {
    return global.guild.members.cache.get(userId);
};

/**
 * Listens for rate limit events and logs a warning if one occurs.
 * @example
 * client.rateLimitCheck();
 */
Client.prototype.rateLimitCheck = function () {
    this.on('rateLimit', info => {
        global.client.warning(`Rate limit hit! Timeout: ${info.timeout}, Limit: ${info.limit}, Method: ${info.method}, Path: ${info.path}`);
    });
};

/**
 * Gets the number of members in the guild, optionally including bots.
 * @param {boolean} [includeBots=false] Whether to include bots in the count.
 * @returns {number} The number of members in the guild.
 */
Client.prototype.getMemberCount = function (includeBots = false) {
    this.on('guildCreate', () => {
        updateMemberCount(includeBots);
    });

    this.on('guildMemberAdd', () => {
        updateMemberCount(includeBots);
    });

    this.on('guildMemberRemove', () => {
        updateMemberCount(includeBots);
    });

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