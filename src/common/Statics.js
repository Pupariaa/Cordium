//@ts-check
'use-strict'

const { PermissionOverwrites } = require("discord.js");

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
 * @typedef {  | 'textChannelName'} TextChannelNames
 */
/**
 * @typedef { } VoiceChannelNames
 */
/**
 * @typedef { } ForumChannelNames
 */
/**
 * @typedef {  | 'textChannelName'} ChannelName
 */
class BaseChannel {
    constructor(guild) {
        this.client = global.client;
        this.guild = guild
    }

    /**
     * Returns the channel object from its environmental ID.
     * @param {string} channelId - The channel ID to retrieve.
     * @returns {Promise<Object|null>} - The channel or null object if it does not exist.
     */
    async getChannel(channelId) {
        const guild = this.client.guilds.cache.first();
        try {
            return channelId ? guild.channels.cache.get(channelId) : null;
        } catch (error) {
            await global.client.error(`Error fetching channel with ID "${channelId}" ${error}:`)
            return null;
        }
    }

    /**
     * Returns the channel ID from the environment.
     * @param {string} channelId - The channel ID in the environment.
     * @returns {string|null} - The channel ID or null if it does not exist.
     */
    getChannelId(channelId) {
        return channelId || null;
    }
}

class TextChannels extends BaseChannel {
    constructor(guild) {
        super(guild);
        this.channels = {//Declare ChannelNames->ChannelsId of config.env,
            //CLIMarker#01
            textChannelName: process.env.textChannelName,
        };
    }

    /**
     * Returns the object of the text channel if the key exists.
     * @param {TextChannelNames} channelName - The name of the channel to retrieve.
     * @returns {Promise<Object|null>} - The text channel object or null if it does not exist.
     */
    async get(channelName) {
        return this.channels[channelName] ? await this.getChannel(this.channels[channelName]) : null
    }

    /**
     * Returns the ID of the text channel if the key exists.
     * @param {TextChannelNames} channelName - The name of the channel to retrieve.
     * @returns {string|null} - The ID of the text channel or null if it does not exist.
     */
    getId(channelName) {
        return this.channels[channelName] ? this.channels[channelName] : null
    }
}

class VoiceChannels extends BaseChannel {
    constructor(guild) {
        super(guild);
        this.channels = {
            //CLIMarker#02
        };
    }

    /**
     * Returns the voice channel object if the key exists.
     * @param {VoiceChannelNames} channelName - The name of the channel to retrieve.
     * @returns {Promise<Object|null>} - L’objet channel vocal ou null s’il n’existe pas.
     */
    async get(channelName) {
        return this.channels[channelName] ? await this.getChannel(this.channels[channelName]) : null
    }

    /**
     * Returns the ID of the voice channel if the key exists.
     * @param {VoiceChannelNames} channelName - The name of the channel to retrieve.
     * @returns {string|null} - The ID of the vocal channel or null is not existent.
     */
    getId(channelName) {
        return this.channels[channelName] ? this.channels[channelName] : null
    }
}


class ForumChannels extends BaseChannel {
    constructor(client) {
        super(client);
        this.channels = {
            //CLIMarker#03
        };
    }

    async get(channelName) {
        return this.channels[channelName] ? await this.getChannel(this.channels[channelName]) : null
    }

    getId(channelName) {
        this.channels[channelName] ? this.channels[channelName] : null
    }
}


class Statics {
    constructor() {
        this.client = global.client
        this.guild = this.client.guilds.cache.first();
        this.channels = {
            text: new TextChannels(this.guild),
            voice: new VoiceChannels(this.guild)
        };
    }
}



class Channels {
    constructor() {
        this.client = global.client
        this.guild = this.client.guilds.cache.first();
        this.channels = {
            text: new TextChannels(this.guild),
            voice: new VoiceChannels(this.guild),
            forum: new ForumChannels(this.guild)
        };
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
     * @param {Object|null} userid
     * @returns {Promise<Message|ForumChannels|null>} - The message or thread sent, or null if it does not exist.
     */
    async send(channelName, data, userid) {
        let channel;

        channel = await this.channels.text.get(channelName);
        !channel ? channel = await this.channels.voice.get(channelName) : null
        !channel ? channel = await this.channels.forum.get(channelName) : null


        if (channel) {

            try {
                return await channel.send(data);
            } catch (error) {
                global.client.error(`Failed to send message to channel "${channelName}": ${error}`)
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

module.exports = { Statics, Channels };