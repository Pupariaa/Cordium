const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { Collection, Sticker, cleanContent } = require('discord.js');
const { __cfn, __cf } = eval(require(`current_filename`));
const { report, reportWarn, reportError } = console.createReports(__cfn);

const { getOrNull } = require(global.utilsPath);

class MessagesDatabase {
    messagesDbFilename = 'messages.db'
    lastMessagesIdFilename = 'lastMessagesId.json'

    constructor(
        dbPath = path.join(global.projectRoot, 'internals', 'cache', this.messagesDbFilename),
        cachePath = path.join(global.projectRoot, 'internals', 'cache', this.lastMessagesIdFilename)
    ) {
        const functionName = 'constructor';
        this.cachePath = cachePath;
        this.dbPath = dbPath;
        this.#defineTablesColumns();
        this.messageSQLFields = Object.keys(this.messagesTableColumns).filter(key => key !== 'id').join(', ');
        this.messageSQLValues = Object.keys(this.messagesTableColumns).filter(key => key !== 'id').map(() => '?').join(', ');
        report(__line, functionName, `${this.messagesDbFilename} path set to:`, dbPath);
        report(__line, functionName, `${this.lastMessagesIdFilename} path set to:`, cachePath);
        global.sigintSubscribers.push(this.close.bind(this));
    }

    #defineTablesColumns() {
        this.messagesTableColumns = {
            id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
            messageId: 'INTEGER NOT NULL',
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
            messageId: 'INTEGER NOT NULL',
            partyId: 'TEXT NOT NULL',
            type: 'TEXT NOT NULL CHECK(type >= 0 AND type <= 3)'
        };
        this.attachmentsTableColumns = {
            id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
            messageId: 'INTEGER NOT NULL',
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

    #connectToDatabase() {
        const functionName = 'connectToDatabase';
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    reportError(__line, functionName, 'Error initializing database:', err);
                    reject(err);
                } else {
                    report(__line, functionName, 'Connected to the SQLite database');
                    resolve();
                }
            });
        });
    }

    async init() {
        // TODO: it seems that not all messages are fetched and cached the first run
        const functionName = 'init';
        try {
            await this.#connectToDatabase();
            report(__line, functionName, 'Initializing messagesDatabase...');
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
                promises.push(this.set(message));
                if (!(message.channel.id in mostRecentTimestamps) || message.createdTimestamp > mostRecentTimestamps[message.channel.id]) {
                    this.lastMessagesId[message.channel.id] = message.id;
                    mostRecentTimestamps[message.channel.id] = message.createdTimestamp;
                }
            };
            global.guild.channels.cache.each((channel) => {
                if (!channel.isTextBased()) return;
                report(__line, functionName, 'Fetching messages from channel:', channel.name);
                channel.fetchAllMessages(applyToAll, applyToEvery, getFetchOptions, getDefaultLastId(channel));
            });

            await Promise.all(promises);
            report(__line, functionName, 'messagesDatabase initialized');
        } catch (error) {
            reportError(__line, functionName, 'Initialization error:', error);
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

    #createTables() {
        const functionName = 'createTables';
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
                        reportError(__line, functionName, 'Error creating table:', err);
                        reject(err);
                    } else {
                        report(__line, functionName, 'Table "messages" created');
                        resolve();
                    }
                })
            )
        ));
    }

    #extractFields(message) {
        const reference = `${getOrNull(message, 'reference.guildId')},${getOrNull(message, 'reference.channelId')},${getOrNull(message, 'reference.messageId')}`;
        const stickers = Object.values(message.stickers);
        return [
            message.id, message.type, message.author.id, message.channelId, message.content, message.createdTimestamp, message.crosspostable,
            message.editedAt, message.flags.bitfield, getOrNull(message, 'groupActivityApplication.id'), getOrNull(message, 'thread.id'), message.pinned,
            reference, stickers.length ? stickers[0].id : null, message.system, message.tts, message.webhookId
        ];
    }

    set(message) {
        const functionName = 'set';
        this.lastMessagesId[message.channel.id] = message.id;
        const insertsSQL = [`INSERT INTO messages (${this.messageSQLFields}) VALUES (${this.messageSQLValues})`];
        const params = [this.#extractFields(message)];
        /*
        if (message.activity) {
            insertsSQL.push(`TODO`);
            params.push(`TODO`);
        }
        for (const attachment of message.attachments.values()) {
            insertsSQL.push(`TODO`);
            params.push(`TODO`);
        }
        if (message.call) {
            insertsSQL.push(`TODO`);
            params.push(`TODO`);
        }
        for (const component of message.components) {
            insertsSQL.push(`TODO`);
            params.push(`TODO`);
        }
        for (const embed of message.embeds) {
            insertsSQL.push(`TODO`);
            params.push(`TODO`);
        }
        if (message.interactionMetadata) {
            insertsSQL.push(`TODO`);
            params.push(`TODO`);
        }
        for (const mention of message.mentions) {
            insertsSQL.push(`TODO`);
            params.push(`TODO`);
        }
        if (message.poll) {
            insertsSQL.push(`TODO`);
            params.push(`TODO`);
        }
        for (const reaction of message.reactions) {
            insertsSQL.push(`TODO`);
            params.push(`TODO`);
        }
        if (message.roleSubscriptionData) {
            insertsSQL.push(`TODO`);
            params.push(`TODO`);
        }
        global.attachmentsManager.saveAttachments(message);
        for (const attachment of message.attachments.values()) {
            insertsSQL.push(`TODO`);
            params.push(`TODO`);
        }
        */
        return Promise.all(insertsSQL.map((insertSQL, index) =>
            new Promise((resolve, reject) =>
                this.db.run(insertSQL, params[index], (err) => {
                    if (err) {
                        reportError(__line, functionName, 'Error inserting message:', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                })
            )
        ));
    }

    get(id) {
        return new Promise((resolve, reject) =>
            this.db.get(`SELECT * FROM messages WHERE messageId = ?`, [id], (err, cachedMessage) => {
                if (err) {
                    reportError(__line, functionName, 'Error getting message:', err);
                    reject(err);
                } else {
                    resolve(this.#cachedMessageToMessage(cachedMessage));
                }
            })
        );
    }

    forEach(callback) {
        const functionName = 'forEach';
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM messages', [], (err, cachedMessages) => {
                if (err) {
                    reportError(__line, functionName, 'Error retrieving messages:', err);
                    reject(err);
                } else {
                    cachedMessages.forEach((cachedMessage) => callback(this.#cachedMessageToMessage(cachedMessage)));
                    resolve();
                }
            });
        });
    }

    update(newMessage) {
        const functionName = 'update';
        const insertOrReplaceSQL = `UPDATE messages SET (${this.messageSQLFields}) = (${this.messageSQLValues}) WHERE messageId = ${newMessage.id}`;
        const params = this.#extractFields(newMessage);
        return new Promise((resolve, reject) =>
            this.db.run(insertOrReplaceSQL, params, (err) => {
                if (err) {
                    reportError(__line, functionName, 'Error updating message:', err);
                    reject(err);
                } else {
                    resolve();
                }
            })
        );
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

    feedDiscordjs() {
        const functionName = 'feedDiscordjs';
        return this.forEach((message) => {
            const channel = global.client.getChannelById(message.channel.id);
            if (!channel) reportError(__line, functionName, `Channel ${message.channel.id} not found`);
            if (message.content === 'qsdq') console.log(`caching ${message.id} (${message.content.abbreviate(10)})`);
            channel.messages.cache.set(message.id, message);
        });
    }

    close() {
        const functionName = 'close';
        if (this.lastMessagesId) {
            const stringifiedLastMessagesId = JSON.stringify(this.lastMessagesId, null, 4);
            if (stringifiedLastMessagesId) fs.writeFileSync(this.cachePath, stringifiedLastMessagesId, 'utf8');
        }
        if (!this.db) return;
        return new Promise((resolve, reject) =>
            this.db.close((err) => {
                if (err) {
                    reportError(__line, functionName, 'Error closing database:', err);
                    reject(err);
                } else {
                    report(__line, functionName, 'Database connection closed successfully.');
                    resolve();
                }
            })
        );
    }
}

module.exports = MessagesDatabase;