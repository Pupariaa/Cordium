'use-strict';
const { __cfn, __cf } = eval(require(`current_filename`));
const { report, reportWarn, reportError } = console.createReports(__cfn);

function _getById(channelId) {
    const functionName = 'getChannel';
    try {
        return channelId ? global.guild.channels.cache.get(channelId) : null;
    } catch (err) {
        reportError(__line, functionName, `Error fetching channel with ID ${channelId}:`, err);
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
                r.push(_getByName(channelName));
                break;
            }
        }
    }
    return r;
}

class Channels {
    constructor() {
    }

    getById = function(channelId) {
        return _getById(channelId);
    }

    getByName = function(channelName) {
        return this.text.getByName(channelName) || this.voice.getByName(channelName) || this.forum.getByName(channelName);
    }

    getByTags = function(...tags) {
        return [...this.text.getByTags(...tags), ...this.voice.getByTags(...tags), ...this.forum.getByTags(...tags)];
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

module.exports = Channels;