//@ts-check
'use-strict';
const fs = require('fs');
require('puparia.getlines.js')

const { AuditLogEvent } = require('discord.js');

/*!
 * UNFMLA-CQD Project
 * Copyright (c) 2024 Puparia
 * All rights reserved.
 * 
 * This software is the confidential and proprietary information of Puparia.
 * You shall not disclose or use it except in accordance with the terms of the 
 * license agreement you entered into with Puparia.
 */

/**
 * @typedef {string} TextChannelNames
 * @typedef {string} VoiceChannelNames
 * @typedef {string} ForumChannelNames
 */

/**
 * @typedef {'TextChannelNames' | 'VoiceChannelNames' | 'ForumChannelNames'} ChannelName
 */

class BaseChannel {
    constructor() {}

    /**
     * Returns the channel object from its environmental ID.
     * @param {string | null} channelId - The channel ID to retrieve.
     * @returns {Promise<Object|null>} - The channel or null if it does not exist.
     */
    async getChannel(channelId) {
        try {
            return channelId ? global.guild.channels.cache.get(channelId) : null;
        } catch (err) {
            console.error(`${__filename} - Line ${__line} (getChannel): Error fetching channel with ID ${channelId}:`, err);
            return null;
        }
    }
}

class TextChannels extends BaseChannel {
    constructor() {
        super();
        this.channels = JSON.parse(fs.readFileSync('channels.json', 'utf-8')).text;
    }

    /**
     * Returns the text channel object if the key exists.
     * @param {TextChannelNames} channelName - The name of the text channel to retrieve.
     * @returns {Promise<Object|null>} - The text channel object or null if it does not exist.
     */
    async get(channelName) {
        return this.getChannel(this.channels[channelName]);
    }

    /**
     * Fetch all messages from a channel.
     * @param {Object} channel - The name of the channel to fetch from.
     * @returns {Promise<Object[] | null>} - The messages fetched. If the channel does not exist, or is not a text channel, returns null.
     */
    async fetchAllMessages(channel) {
        const functionName = 'fetchAllMessages';
        if (!channel || channel.type !== 0) {
            console.warn(`${__filename} - Line ${__line} (${functionName}): Channel ${channel.name} is not a text channel.`);
            return null;
        }
        let lastId = null;
        let fetchedMessages = [];
        const r = [];
        do {
            fetchedMessages = Array.from((await channel.messages.fetch({ limit: 100, before: lastId })).values());
            if (fetchedMessages.length === 0) {
                break;
            }
            fetchedMessages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
            lastId = fetchedMessages[0].id;
            for (let i = fetchedMessages.length - 1; i >= 0; i--) {
                r.unshift(fetchedMessages[i]);
            }
        } while (fetchedMessages.length === 100);
        return r;
    }
}

class VoiceChannels extends BaseChannel {
    constructor() {
        super();
        this.channels = JSON.parse(fs.readFileSync('channels.json', 'utf-8')).VoiceChannelNames;
    }

    /**
     * Returns the voice channel object if the key exists.
     * @param {VoiceChannelNames} channelName - The name of the voice channel to retrieve.
     * @returns {Promise<Object|null>} - The voice channel object or null if it does not exist.
     */
    async get(channelName) {
        return this.getChannel(this.channels[channelName]);
    }

    async getMembers(channel) {
        if (!channel) return null;
        return Array.from(channel.members.values());
    }
}

class ForumChannels extends BaseChannel {
    constructor() {
        super();
        this.channels = JSON.parse(fs.readFileSync('channels.json', 'utf-8')).ForumChannelNames;
    }

    /**
     * Returns the forum channel object if the key exists.
     * @param {ForumChannelNames} channelName - The name of the forum channel to retrieve.
     * @returns {Promise<Object|null>} - The forum channel object or null if it does not exist.
     */
    async get(channelName) {
        return this.getChannel(this.channels[channelName]);
    }
}

class Channels {
    constructor() {
        this.text = new TextChannels();
        this.voice = new VoiceChannels();
        this.forum = new ForumChannels();
    }

    /**
     * Returns the channel object if the key exists.
     * @param {ChannelName} channelName - The name of the channel to retrieve.
     * @returns {Promise<Object|null>} - The channel or null object if it does not exist.
     */
    async get(channelName) {
        let channel = await this.text.get(channelName);
        if (!channel) channel = await this.voice.get(channelName);
        if (!channel) channel = await this.forum.get(channelName);
        return channel;
    }

    /**
     * @typedef {Object} ForumData
     * @property {string} title - The title of the thread to create..
     * @property {string} [content] - The content of the first thread message. Optional.
     */

    /**
     * Send a message to a channel using its pseudoname.
     * @param {ChannelName} channelName - The name of the channel to send the message to.
     * @param {string|Object|ForumData} data - The message data to be sent.
     * @returns {Promise<Object|null>} - The message or thread sent, or null if it does not exist.
     */
    async send(channelName, data) {
        const functionName = 'send';
        const channel = await this.get(channelName);
        if (channel) {
            try {
                return await channel.send(data);
            } catch (error) {
                console.error(`${__filename} - Line ${__line} (${functionName}): Failed to send message to channel "${channelName}: `, error);
                return null;
            }
        }
        return null;
    }

    /**
     * Rename a channel.
     * @param {Object} channel - The channel to rename.
     * @param {string} newName - The new name for the channel.
     * @returns {Promise<Object|null>} - The channel object, or null if it does not exist or if the rename failed.
     */
    async rename(channel, newName) {
        const functionName = 'rename';
        const channelName = channel.name;
        if (channel) {
            try {
                await channel.setName(newName);
                console.info(`${__filename} - Line ${__line} (${functionName}): Channel "${channelName}" renamed to "${newName}".`);

                return channel;
            } catch (error) {
                console.error(`${__filename} - Line ${__line} (${functionName}): Failed to rename channel "${channelName}":`, error);
                return null;
            }
        }
        console.error(`${__filename} - Line ${__line} (${functionName}): Channel "${channelName}" not found.`);
        return null;
    }

    /**
     * Fetch the creator of a channel.
     * @param {Object} channel - The channel to get the creator for.
     * @returns {GuildMember|null} - The creator of the channel, or null if the audit log is not available or if the channel does not exist.
     */
    async getCreator(channel) {
        // const functionName = 'getCreator';
        let auditLogs = await global.guild.fetchAllAuditLogs();
        if (!auditLogs) return null;
        for (const entry of auditLogs) {
            if (entry.action === AuditLogEvent.ChannelCreate && entry.target.id === channel.id) return entry.executor;
        }
        return null;
    }
}

module.exports = { Channels };