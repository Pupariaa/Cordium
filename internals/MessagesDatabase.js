const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { Collection, Sticker, cleanContent } = require('discord.js');

const { getOrNull } = require(global.utilsPath);

class MessagesDatabase {
    messagesDbFilename = 'messages.db'
    lastMessagesIdFilename = 'lastMessagesId.json'

    constructor(
        dbPath = path.join(global.projectRoot, 'internals', 'cache', this.messagesDbFilename),
        cachePath = path.join(global.projectRoot, 'internals', 'cache', this.lastMessagesIdFilename)
    ) {
        this.cachePath = cachePath;
        this.dbPath = dbPath;
        this.#defineTablesColumns();
        this.messageSQLFields = Object.keys(this.messagesTableColumns).filter(key => key !== 'id').join(', ');
        this.messageSQLValues = Object.keys(this.messagesTableColumns).filter(key => key !== 'id').map(() => '?').join(', ');
        console.report(`${this.messagesDbFilename} path set to:`, dbPath);
        console.report(`${this.lastMessagesIdFilename} path set to:`, cachePath);
        global.sigintSubscribers.push(this.close.bind(this));
    }

    #defineTablesColumns() {
        this.messagesTableColumns = {
            id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
            messageId: 'TEXT NOT NULL',
            type: 'INTEGER NOT NULL',
            authorId: 'TEXT NOT NULL',
            channelId: 'TEXT NOT NULL',
            content: 'TEXT NOT NULL',
            createdTimestamp: 'INTEGER NOT NULL',
            crosspostable: 'BOOLEAN NOT NULL',
            editedAt: 'INTEGER',
            flags: 'INTEGER NOT NULL',
            activityApplicationId: 'TEXT',
            threadId: 'TEXT',
            pinned: 'BOOLEAN NOT NULL',
            reference: 'TEXT',
            stickerId: 'TEXT',
            system: 'BOOLEAN NOT NULL',
            tts: 'BOOLEAN NOT NULL',
            webhookId: 'TEXT'
        };
        this.partiesTableColumns = {
            id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
            messageId: 'TEXT NOT NULL',
            partyId: 'TEXT NOT NULL',
            type: 'TEXT NOT NULL CHECK(type >= 0 AND type <= 3)'
        };
        this.attachmentsTableColumns = {
            id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
            messageId: 'TEXT NOT NULL',
            contentType: 'TEXT NOT NULL',
            description: 'TEXT',
            duration: 'INTEGER',
            ephemeral: 'BOOLEAN NOT NULL',
            flags: 'INTEGER NOT NULL',
            height: 'INTEGER',
            attachmentId: 'TEXT NOT NULL',
            name: 'TEXT NOT NULL',
            proxyUrl: 'TEXT NOT NULL',
            size: 'INTEGER NOT NULL',
            spoiler: 'BOOLEAN NOT NULL',
            title: 'TEXT',
            url: 'TEXT NOT NULL',
            waveform: 'TEXT',
            width: 'INTEGER'
        };
    }

    #createTables() {
        const createsSQL = [
            `CREATE TABLE IF NOT EXISTS messages (
                ${Object.entries(this.messagesTableColumns)
                .map(([column, definition]) => `${column} ${definition}`)
                .join(', ')}
            )`
        ];
        return Promise.all(createsSQL.map(createSQL =>
            new Promise((resolve, reject) =>
                this.db.run(createSQL, (err) => {
                    if (err) {
                        console.reportError('Error creating table:', err);
                        reject(err);
                    } else {
                        console.report('Table "messages" created');
                        resolve();
                    }
                })
            )
        ));
    }

    #connectToDatabase() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.reportError('Error initializing database:', err);
                    reject(err);
                } else {
                    console.report('Connected to the SQLite database');
                    resolve();
                }
            });
        });
    }

    async init() {
        try {
            await this.#connectToDatabase();
            console.report('Initializing messagesDatabase...');
            await this.#createTables();
            const promises = [];
            let applyToAll, getFetchOptions, getDefaultLastId;
            if (fs.existsSync(this.cachePath)) {
                this.lastMessagesId = JSON.parse(fs.readFileSync(this.cachePath), "utf-8");
                applyToAll = global.channels.fetchAllMessages.scanDown;
                getFetchOptions = (lastId) => ({ after: lastId });
                getDefaultLastId = (channel) => this.lastMessagesId[channel.id];
            } else {
                this.lastMessagesId = {};
                applyToAll = global.channels.fetchAllMessages.scanUp;
                getFetchOptions = (lastId) => ({ before: lastId });
                getDefaultLastId = (channel) => null;
            }
            let mostRecentTimestamps = {};
            const applyToEvery = (message, r) => {
                promises.push(this.#set(message));
                if (!(message.channel.id in mostRecentTimestamps) || message.createdTimestamp > mostRecentTimestamps[message.channel.id]) {
                    this.lastMessagesId[message.channel.id] = message.id;
                    mostRecentTimestamps[message.channel.id] = message.createdTimestamp;
                }
            };
            global.guild.channels.cache.each((channel) => {
                if (!channel.isTextBased()) return;
                console.report('Fetching messages from channel:', channel.name);
                channel.fetchAllMessages(applyToAll, applyToEvery, getFetchOptions, getDefaultLastId(channel));
            });

            await Promise.all(promises);
            console.report('messagesDatabase initialized');
        } catch (error) {
            console.reportError('Initialization error:', error);
        }
    }

    /*
      TODO:
        - parties table
        - attachments table
        - calls table
        - components table
        - embeds table
        - interactions table
        - mentions table
        - polls table
        - reactions table
        - subscriptions table
      
      infos:
        - flags:
            Crossposted
            IsCrosspost
            SuppressEmbeds
            SourceMessageDeleted
            Urgent
            HasThread
            Ephemeral
            Loading
            FailedToMentionSomeRolesInThread
            
            ShouldShowLinkNotDiscordWarning
  
            SuppressNotifications
            IsVoiceMessage
        
        - dynamics:
            content
            editedAt
            flags
            hasThread
            mentionsId
            pinned
        - notes:
            reference is guildId,channelId,messageId, any of them can be null
  
    */

    #extractFields(message) {
        const reference = `${getOrNull(message, 'reference.guildId')},${getOrNull(message, 'reference.channelId')},${getOrNull(message, 'reference.messageId')}`;
        const stickers = Object.values(message.stickers);
        return [
            message.id, message.type, message.author.id, message.channelId, message.content, message.createdTimestamp, message.crosspostable,
            message.editedAt, message.flags.bitfield, getOrNull(message, 'groupActivityApplication.id'), getOrNull(message, 'thread.id'), message.pinned,
            reference, stickers.length ? stickers[0].id : null, message.system, message.tts, message.webhookId
        ];
    }

    #set(message) {
        const insertsSQL = [`INSERT INTO messages (${this.messageSQLFields}) VALUES (${this.messageSQLValues})`];
        const params = [this.#extractFields(message)];
        /*
        TODO
        if (message.activity) {
            insertsSQL.push(``);
            params.push(``);
        }
        for (const attachment of message.attachments.values()) {
            insertsSQL.push(``);
            params.push(``);
        }
        if (message.call) {
            insertsSQL.push(``);
            params.push(``);
        }
        for (const component of message.components) {
            insertsSQL.push(``);
            params.push(``);
        }
        for (const embed of message.embeds) {
            insertsSQL.push(``);
            params.push(``);
        }
        if (message.interactionMetadata) {
            insertsSQL.push(``);
            params.push(``);
        }
        for (const mention of message.mentions) {
            insertsSQL.push(``);
            params.push(``);
        }
        if (message.poll) {
            insertsSQL.push(``);
            params.push(``);
        }
        for (const reaction of message.reactions) {
            insertsSQL.push(``);
            params.push(``);
        }
        if (message.roleSubscriptionData) {
            insertsSQL.push(``);
            params.push(``);
        }
        global.attachmentsManager.saveAttachments(message);
        for (const attachment of message.attachments.values()) {
            insertsSQL.push(``);
            params.push(``);
        }
        */
        return Promise.all(insertsSQL.map((insertSQL, index) =>
            new Promise((resolve, reject) =>
                this.db.run(insertSQL, params[index], (err) => {
                    if (err) {
                        console.reportError('Error inserting message:', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                })
            )
        ));
    }

    set(message) {
        const promise = this.#set(message);
        this.lastMessagesId[message.channel.id] = message.id;
        return promise;
    }

    #cachedMessageToMessage(cachedMessage) {
        // TODO: build back the discordjs Message object
        const member = global.client.getMemberById(cachedMessage.authorId);
        const author = member?.user || null;
        const content = cachedMessage.content;
        const channel = global.client.getChannelById(cachedMessage.channelId);
        const references = cachedMessage.reference.split(',');
        const reference_channelId = references[0] === 'null' ? null : references[0];
        const reference_guildId = references[1] === 'null' ? null : references[1];
        const reference_messageId = references[2] === 'null' ? null : references[2];
        const stickersList = [];
        if (cachedMessage.stickerId) stickersList.push(new Sticker(author, { id: cachedMessage.stickerId }));
        const stickers = new Collection(stickersList);
        return {
            activity: null,
            applicationId: author?.bot ? author.id : null,
            attachments: null,
            author: author,
            bulkDeletable: null,
            call: null,
            channel: channel,
            channelId: cachedMessage.channelId,
            cleanContent: content != null ? cleanContent(content, channel) : null,
            client: author,
            components: null,
            content: content,
            createdAt: null,
            createdTimestamp: cachedMessage.createdTimestamp,
            crosspostable: cachedMessage.crosspostable,
            deletable: null,
            editable: null,
            editedAt: cachedMessage.editedAt,
            editedTimestamp: null,
            embeds: null,
            flags: cachedMessage.flags,
            groupActivityApplication: cachedMessage.activityApplicationId, // TODO: get or build back the discordjs ClientApplication object
            guild: global.guild,
            guildId: global.guild.id,
            hasThread: cachedMessage.threadId != null,
            id: cachedMessage.messageId,
            interaction: null,
            interactionMetadata: null,
            member: member,
            mentions: null,
            nonce: null,
            partial: null,
            pinnable: null,
            pinned: cachedMessage.pinned,
            poll: null,
            position: null,
            reactions: null,
            reference: { channelId: reference_channelId, guildId: reference_guildId, messageId: reference_messageId },
            resolved: null,
            roleSubscriptionData: null,
            stickers: stickers,
            system: cachedMessage.system,
            thread: cachedMessage.threadId, // TODO: get or build back the discordjs Thread object
            tts: cachedMessage.tts,
            type: cachedMessage.type,
            url: `https://discord.com/channels/${global.guild.id}/${channel.id}/${cachedMessage.messageId}`,
            webhookId: cachedMessage.webhookId
        }
    }

    get(id) {
        return new Promise((resolve, reject) =>
            this.db.get(`SELECT * FROM messages WHERE messageId = ?`, [id], (err, cachedMessage) => {
                if (err) {
                    console.reportError('Error getting message:', err);
                    reject(err);
                } else {
                    resolve(this.#cachedMessageToMessage(cachedMessage));
                }
            })
        );
    }

    each(callback) {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM messages', [], (err, cachedMessages) => {
                if (err) {
                    console.reportError('Error retrieving messages:', err);
                    reject(err);
                } else {
                    cachedMessages.forEach((cachedMessage) => callback(this.#cachedMessageToMessage(cachedMessage)));
                    resolve();
                }
            });
        });
    }

    update(newMessage) {
        const insertOrReplaceSQL = `UPDATE messages SET (${this.messageSQLFields}) = (${this.messageSQLValues}) WHERE messageId = ${newMessage.id}`;
        const params = this.#extractFields(newMessage);
        return new Promise((resolve, reject) =>
            this.db.run(insertOrReplaceSQL, params, (err) => {
                if (err) {
                    console.reportError('Error updating message:', err);
                    reject(err);
                } else {
                    resolve();
                }
            })
        );
    }

    delete(messageId) {
        return new Promise((resolve, reject) =>
            this.db.run(`DELETE FROM messages WHERE messageId = ?`, [messageId], (err) => {
                if (err) {
                    console.reportError('Error deleting message:', err);
                    reject(err);
                } else {
                    resolve();
                }
            })
        );
    }

    bulkDelete(channelId) {
        return new Promise((resolve, reject) =>
            this.db.run(`DELETE FROM messages WHERE channelId = ?`, [channelId], (err) => {
                if (err) {
                    console.reportError('Error deleting messages:', err);
                    reject(err);
                } else {
                    resolve();
                }
            })
        );
    }

    async feedDiscordjs() {
        const messageIdsToDelete = [];
        await this.each((message) => {
            const channel = message.channel;
            if (!channel) {
                // associated channel no longer exists
                messageIdsToDelete.push(message.id);
                return;
            }
            if (!channel.messages.cache.get(message.id)) {
                channel.messages.cache.set(message.id, message);
            }
        });
        const promises = [];
        messageIdsToDelete.forEach((id) => promises.push(this.delete(id)));
        await Promise.all(promises);
    }

    close() {
        if (this.lastMessagesId) {
            const stringifiedLastMessagesId = JSON.stringify(this.lastMessagesId, null, 4);
            if (stringifiedLastMessagesId) {
                fs.writeFileSync(this.cachePath, stringifiedLastMessagesId, 'utf8');
            } else {
                console.reportWarn('Serialization of lastMessagesId failed');
            }
        }
        if (!this.db) return;
        return new Promise((resolve, reject) =>
            this.db.close((err) => {
                if (err) {
                    console.reportError('Error closing database:', err);
                    reject(err);
                } else {
                    console.report('Database connection closed successfully.');
                    resolve();
                }
            })
        );
    }
}

module.exports = MessagesDatabase;