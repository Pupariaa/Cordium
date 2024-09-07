//@ts-check
'use-strict';
const fs = require('fs');
require('puparia.getlines.js')

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
 * @typedef {Object} TextChannelNames
 * @typedef {Object} VoiceChannelNames
 * @typedef {Object} ForumChannelNames
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

    /**
     * Returns the ID of the channel based on its name.
     * @param {string} channelName - The name of the channel to retrieve the ID for.
     * @param {Object} dic - Dictionary containing channel names and IDs.
     * @returns {Promise<string|null>} - The channel ID or null if it does not exist.
     */
    async getId(channelName, dic) {
        const r = dic[channelName];
        return r ? r : null;
    }
}

class TextChannels extends BaseChannel {
    constructor() {
        super();
        this.channels = JSON.parse(fs.readFileSync('channels.json', 'utf-8')).TextChannelNames;
    }

    /**
     * Returns the text channel object if the key exists.
     * @param {TextChannelNames} channelName - The name of the text channel to retrieve.
     * @returns {Promise<Object|null>} - The text channel object or null if it does not exist.
     */
    async get(channelName) {
        return this.getChannel(await this.getId(channelName, this.channels));
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
        return this.getChannel(await this.getId(channelName, this.channels));
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
        return this.getChannel(await this.getId(channelName, this.channels));
    }
}

class Channels {
    constructor() {
        this.channels = {
            text: new TextChannels(),
            voice: new VoiceChannels(),
            forum: new ForumChannels()
        };
    }

    /**
     * Returns the channel object if the key exists.
     * @param {ChannelName} channelName - The name of the channel to retrieve.
     * @returns {Promise<Object|null>} - The channel or null object if it does not exist.
     */
    async get(channelName) {
        let channel = await this.channels.text.get(channelName);
        if (!channel) channel = await this.channels.voice.get(channelName);
        if (!channel) channel = await this.channels.forum.get(channelName);
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
        const channel = await this.get(channelName);
        if (channel) {
            try {
                return await channel.send(data);
            } catch (error) {
                console.error(`${__filename} - Line ${__line} (send): Failed to send message to channel "${channelName}: `, error);
                return null;
            }
        }
        return null;
    }

    /**
     * Fetch all messages from a channel.
     * @param {Object} channel - The name of the channel to fetch from.
     * @returns {Promise<Object[] | null>} - The messages fetched. If the channel does not exist, or is not a text channel, returns null.
     */
    async fetchAll(channel) {
        if (!channel || channel.type !== 0) {
            return null;
        }
        let lastId = null;
        let fetchedMessages = [];
        const result = [];
        do {
            fetchedMessages = Array.from((await channel.messages.fetch({ limit: 100, before: lastId })).values());
            if (fetchedMessages.length === 0) {
                break;
            }
            fetchedMessages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
            lastId = fetchedMessages[0].id;
            for (let i = fetchedMessages.length - 1; i >= 0; i--) {
                result.unshift(fetchedMessages[i]);
            }
        } while (fetchedMessages.length === 100);
        return result;
    }

    /**
     * Rename a channel.
     * @param {TextChannelNames} channelName - The name of the channel to rename.
     * @param {string} newName - The new name for the channel.
     * @returns {Promise<Object|null>} - The channel object, or null if it does not exist or if the rename failed.
     */
    async rename(channelName, newName) {
        const channel = await this.get(channelName);
        if (channel) {
            try {
                await channel.setName(newName);
                console.info(`${__filename} - Line ${__line} (rename): Channel "${channelName}" renamed to "${newName}".`);

                return channel;
            } catch (error) {
                console.error(`${__filename} - Line ${__line} (rename): Failed to rename channel "${channelName}":`, error);
                return null;
            }
        }
        console.error(`${__filename} - Line ${__line} (rename): Channel "${channelName}" not found.`);
        return null;
    }
}

module.exports = { Channels };
