'use-strict';

const { validChannelId, getOrNull } = require(global.utilsPath);

const cache = {};

function _getById(channelId) {
    return cache[channelId];
}

function _getByName(category, channelName) {
    const id = getOrNull(global.configChannels, category, channelName, 'id');
    return id ? _getById(id) : null;
}

function _getByTags(category, ...tags) {
    const r = [];
    for (const [channelName, channelAlias] of Object.entries(global.configChannels[category])) {
        for (const tag of tags) {
            if (channelAlias.tags.includes(tag)) {
                const channel = _getByName(category, channelName);
                if (channel) r.push(channel);
                break;
            }
        }
    }
    return r;
}

class Channels {
    constructor() {
        this.categories = Array.from(Object.keys(global.configChannels));
        for (const category of this.categories) {
            cache[category] = {};
            Object.defineProperty(this, category, {
                configurable: false,
                enumerable: true,
                writable: false,
                value: {
                    aliases: global.configChannels[category],
                    getById: function (channelId) {
                        return _getById(channelId);
                    },
                    getByName: function (channelName) {
                        return _getByName(category, channelName);
                    },
                    getByTags: function (...tags) {
                        return _getByTags(category, ...tags);
                    },
                    each: function (callback) {
                        Object.entries(this.channels).forEach((channel) => callback(_getById(channel[1].id)));
                    }
                }
            });
        }
    }

    initCache = function () {
        this.categories.forEach((category) =>
            Object.entries(global.configChannels[category]).forEach(([channelName, channelAlias]) => {
                const channelId = channelAlias.id;
                if (!validChannelId(channelId)) {
                    console.reportWarn(`Invalid channel ID ${channelId} for channel ${channelName}`);
                    return;
                }
                try {
                    cache[channelId] = global.guild.channels.cache.get(channelId);
                } catch (err) {
                    console.reportError(`Error fetching channel with ID ${channelId}:`, err);
                }
            })
        );
    }

    getById = function (channelId) {
        return _getById(channelId);
    }

    getByName = function (channelName) {
        return this.text.getByName(channelName) || this.voice.getByName(channelName) || this.forum.getByName(channelName);
    }

    getByTags = function (...tags) {
        return [...this.text.getByTags(...tags), ...this.voice.getByTags(...tags), ...this.forum.getByTags(...tags)];
    }

    each = function (callback, categories = [...this.categories]) {
        categories.forEach((category) => this[category].each(callback));
    }

    fetchAllMessages = {
        // By default, will return all messages sorted from newest to oldest
        call: async function (
            channel,
            applyToAll = global.channels.fetchAllMessages.sortUp,
            applyToEvery = (message, r) => r.unshift(message),
            getFetchOptions = (lastId) => ({ before: lastId }),
            defaultLastId = null,
            defaultResult = []) {

            const optimalLimit = 100;
            let lastId = defaultLastId;
            const r = defaultResult;
            try {
                let fetchedMessages = [];
                do {
                    fetchedMessages.length = 0;
                    const fetchOptions = getFetchOptions(lastId);
                    fetchOptions.limit = optimalLimit;
                    fetchedMessages = Array.from((await channel.messages.fetch(fetchOptions)).values());
                    if (fetchedMessages.length === 0) break;
                    lastId = applyToAll(fetchedMessages, r);
                    for (let i = fetchedMessages.length - 1; i >= 0; i--) applyToEvery(fetchedMessages[i], r);
                } while (fetchedMessages.length === optimalLimit);
            } catch (err) {
                console.reportError(err);
            }
            return r;
        },

        sort: function (messages, r, sortFunction, getLastId = function (messages) { return messages[0].id }) {
            messages.sort(sortFunction);
            return getLastId(messages);
        },

        // Sorts from newest to oldest
        sortUp: function (messages, r) {
            return global.channels.fetchAllMessages.sort(messages, r, (a, b) => a.createdTimestamp - b.createdTimestamp);
        },

        // Sorts from oldest to newest
        sortDown: function (messages, r) {
            return global.channels.fetchAllMessages.sort(messages, r, (a, b) => b.createdTimestamp - a.createdTimestamp);
        },

        scan: function (messages, r, compare) {
            let lastId = messages[0].id;
            let lastCreatedTimestamp = messages[0].createdTimestamp;
            for (let i = messages.length - 1; i >= 1; i--) {
                const message = messages[i];
                if (compare(message.createdTimestamp, lastCreatedTimestamp)) {
                    lastId = message.id;
                    lastCreatedTimestamp = message.createdTimestamp;
                }
            }
            return lastId;
        },

        // Use when sorting is not necessary from newest to oldest
        scanUp: function (messages, r) {
            return global.channels.fetchAllMessages.scan(messages, r, (t1, t2) => t1 < t2);
        },

        // Use when sorting is not necessary from oldest to newest
        scanDown: function (messages, r) {
            return global.channels.fetchAllMessages.scan(messages, r, (t1, t2) => t1 > t2);
        }
    }
}

module.exports = Channels;