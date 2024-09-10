'use-strict';
require('puparia.getlines.js')

function _getById(channelId) {
    const functionName = 'getChannel';
    try {
        return channelId ? global.guild.channels.cache.get(channelId) : null;
    } catch (err) {
        console.error(`${__filename} - Line ${__line} (${functionName}): Error fetching channel with ID ${channelId}:`, err);
        return null;
    }
}

function _getByName(channels, channelName) {
    return _getById(channels[channelName].id);
}

function _getByTags(channels, ...tags) {
    const r = [];
    for (const [ channelName, channelAlias ] of Object.entries(channels)) {
        for (const tag of tags) {
            if (channelAlias.tags.includes(tag)) {
                r.push(channelName);
                break;
            }
        }
    }
    return r;
}

class Channels {
    constructor() {
    }

    async send(channel, data) {
        const functionName = 'send';
        try {
            return await channel.send(data);
        } catch (err) {
            console.error(`${__filename} - Line ${__line} (${functionName}): `, err);
        }
        return null;
    }

    async rename(channel, newName) {
        const functionName = 'rename';
        // const channelName = channel.name;
        try {
            await channel.setName(newName);
            // console.info(`${__filename} - Line ${__line} (${functionName}): Channel "${channelName}" renamed to "${newName}".`);
            return channel;
        } catch (err) {
            console.error(`${__filename} - Line ${__line} (${functionName}): `, err);
        }
        return null;
    }

    // async getCreator(channel) {
    //     const functionName = 'getCreator';
    //     try {
    //         let auditLogs = await global.guild.fetchAllAuditLogs();
    //         if (!auditLogs) return null;
    //         for (const entry of auditLogs) {
    //             if (entry.action === AuditLogEvent.ChannelCreate && entry.target.id === channel.id) {
    //                 return entry.executor;
    //             }
    //         }
    //     } catch (err) {
    //         console.error(`${__filename} - Line ${__line} (${functionName}): `, err);
    //     }
    //     return null;
    // }

    getById = function(channelId) {
        return _getById(channelId);
    }

    getByName = function(channelName) {
        return this.text.getByName(channelName) || this.voice.getByName(channelName) || this.forum.getByName(channelName);
    }

    getByTags = function(...tags) {
        return this.text.getByTags(...tags) || this.voice.getByTags(...tags) || this.forum.getByTags(...tags);
    }

    text = {
        channels: global.configChannels.text,
        getById: function(channelId) {
            return _getById(channelId);
        },
        getByName: function(channelName) {
            return _getByName(this.channels, channelName);
        },
        getByTags: function(...tags) {
            return _getByTags(this.channels, ...tags);
        }
    }

    voice = {
        channels: global.configChannels.voice,
        getById: function(channelId) {
            return _getById(channelId);
        },
        getByName: function(channelName) {
            return _getByName(this.channels, channelName);
        },
        getByTags: function(...tags) {
            return _getByTags(this.channels, ...tags);
        }
    }

    forum = {
        channels: global.configChannels.forum,
        getById: function(channelId) {
            return _getById(channelId);
        },
        getByName: function(channelName) {
            return _getByName(this.channels, channelName);
        },
        getByTags: function(...tags) {
            return _getByTags(this.channels, ...tags);
        }
    }
}

global.channels = new Channels();