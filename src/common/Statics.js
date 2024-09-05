//@ts-check
'use-strict'

const { PermissionOverwrites } = require("discord.js");
const fs = require('fs');

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
 * @typedef {} TextChannelNames
 */
/**
 * @typedef {} VoiceChannelNames
 */
/**
 * @typedef {} ForumChannelNames
 */
/**
 * @typedef {TextChannelNames | VoiceChannelNames | ForumChannelNames} ChannelName
 */
class BaseChannel {
    constructor() {}

    /**
     * Returns the channel object from its environmental ID.
     * @param {string} channelId - The channel ID to retrieve.
     * @returns {Promise<Object|null>} - The channel or null object if it does not exist.
     */
    async getChannel(channelId) {
        try {
            return channelId ? global.guild.channels.cache.get(channelId) : null;
        } catch (err) {
            console.error(`${__filename} - Line ${__line} (getChannel): Error fetching channel with ID ${channelId}:`, err);
            return null;
        }
    }

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
     * Returns the voice channel object if the key exists.
     * @param {VoiceChannelNames} channelName - The name of the channel to retrieve.
     * @returns {Promise<Object|null>} - L’objet channel vocal ou null s’il n’existe pas.
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
     * @param {VoiceChannelNames} channelName - The name of the channel to retrieve.
     * @returns {Promise<Object|null>} - L’objet channel vocal ou null s’il n’existe pas.
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
     * Returns the voice channel object if the key exists.
     * @param {VoiceChannelNames} channelName - The name of the channel to retrieve.
     * @returns {Promise<Object|null>} - L’objet channel vocal ou null s’il n’existe pas.
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

    async get(channelName) {
        let channel = await this.channels.text.get(channelName);
        !channel ? channel = await this.channels.voice.get(channelName) : null;
        !channel ? channel = await this.channels.forum.get(channelName) : null;
        return channel;
    }

    /**
     * @typedef {Object} ForumData
     * @property {string} title - The title of the thread to create.
     * @property {string} log_type - The title of the thread to create.
     * @property {string} [content] - The content of the first thread message. Optional.
     */

    /**
     * Send a message to a channel using its pseudoname.
     * @param {ChannelName} channelName - The name of the channel to send the message.
     * @param {string|Object|ForumData} data - The message data to be sent.
     * @returns {Promise<Message|ForumChannels|null>} - The message or thread sent, or null if it does not exist.
     */
    async send(channelName, data) {
        const channel = await this.get(channelName);

        if (channel) {

            try {
                return await channel.send(data);
            } catch (error) {
                global.client.error(`Failed to send message to channel "${channelName}": ${error}`);
                return null;
            }
        }
    }

    /**
     * @property {string} name - The name of the channel to be created.
     * @property {ChannelType} type - The type of the channel (text, voice, forum).
     * @property {string} [parentId] - The ID of the parent category (optional).
     * @property {Array<PermissionOverwriteOptions>} [permissionOverwrites] - An array of permission overwrites for the channel (optional).
     */

    /**
     * @property {string} id - The ID of the role or user this overwrite is for.
     */

    /**
     * Creates a new channel in the guild.
     * @returns {Promise<Object|null>} - The created channel object or null if an error occurs.
     */


}

module.exports = { Channels };