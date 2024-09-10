#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const configPath = path.resolve(__dirname, '../config.env');
require('dotenv').config({ path: configPath });

const { Sequelize, DataTypes } = require('sequelize');

class Database {
    /**
     * Constructor for the Database class.
     *
     * If the database connection parameters are not set, logs a message and does nothing.
     *
     * Otherwise, creates a Sequelize instance and defines the models.
     *
     * Finally, attempts to authenticate the connection and logs a message depending on the result.
     */

    constructor(host, dbname, dbport, dbuser, dbpass) {

        this.host = host || null
        this.dbname = dbname || null
        this.dbport = dbport || null
        this.dbuser = dbuser || null
        this.dbpass = dbpass || null

        if (!this.dbname || !this.host || !this.dbuser || !this.dbpass || !this.dbport) {
            console.log('Database connection parameters are missing. Cannot connect. Nothing will be recorded.');
            return;
        }
        this.charset = "utf8mb4";
        this.collate = "utf8mb4_unicode_ci";
        this.sequelize = new Sequelize(this.dbname, this.dbuser, this.dbpass, {
            host: this.host,
            port: this.dbport,
            dialect: 'mysql',
        });

        this.defineModels();

        this.sequelize.authenticate()
            .then(() => console.log('Database connection successful.'))
            .catch(err => console.error('Unable to connect to the database:', err));
    }


    /**
     * Defines the models for the database.
     *
     * This function is called by the constructor and defines all the models used in the database.
     */
    defineModels() {

        this.DATA_channels = this.sequelize.define('DATA_channels', {
          id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
          name: { type: DataTypes.STRING(64), allowNull: false, defaultValue: '' },
          channelId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
          parentId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
          permissions: { type: DataTypes.JSON, allowNull: false },
          datetime: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
          channelType: { type: DataTypes.TINYINT, allowNull: true }
        }, {
          tableName: 'DATA_channels',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
    
        this.EVENTS_channelCreate = this.sequelize.define('EVENTS_channelCreate', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
          channelId: { type: DataTypes.BIGINT, allowNull: true },
          name: { type: DataTypes.STRING(64), allowNull: true },
          permissions: { type: DataTypes.JSON, allowNull: true },
          datetime: { type: DataTypes.BIGINT, allowNull: true },
          isDelete: { type: DataTypes.TINYINT, allowNull: true },
          executorId: { type: DataTypes.BIGINT, allowNull: true }
        }, {
          tableName: 'EVENTS_channelCreate',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
    
        this.EVENTS_channelPinsUpdate = this.sequelize.define('EVENTS_channelPinsUpdate', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
        }, {
          tableName: 'EVENTS_channelPinsUpdate',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_guildBanAdd = this.sequelize.define('EVENTS_guildBanAdd', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
          userid: { type: DataTypes.BIGINT, allowNull: true },
          reason: { type: DataTypes.STRING(255), allowNull: true },
          datetime: { type: DataTypes.BIGINT, allowNull: true },
          executorId: { type: DataTypes.BIGINT, allowNull: true }
        }, {
          tableName: 'EVENTS_guildBanAdd',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
    
        this.EVENTS_guildEmojiCreate = this.sequelize.define('EVENTS_guildEmojiCreate', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
          emojiId: { type: DataTypes.BIGINT, allowNull: true },
          emojiPath: { type: DataTypes.TEXT, allowNull: false },
          datetime: { type: DataTypes.BIGINT, allowNull: true },
          executorId: { type: DataTypes.BIGINT, allowNull: true }
        }, {
          tableName: 'EVENTS_guildEmojiCreate',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
    
        this.EVENTS_guildEmojiDelete = this.sequelize.define('EVENTS_guildEmojiDelete', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
          emojiId: { type: DataTypes.BIGINT, allowNull: true },
          oldEmojiPath: { type: DataTypes.TEXT, allowNull: true },
          newEmojiPath: { type: DataTypes.TEXT, allowNull: true },
          datetime: { type: DataTypes.BIGINT, allowNull: true },
          executorId: { type: DataTypes.BIGINT, allowNull: true }
        }, {
          tableName: 'EVENTS_guildEmojiDelete',
          timestamps: false,
          charset: this.charset,
          collate: this.collate,
          indexes: [{ using: 'BTREE', fields: ['id'] }]
        });
    
        this.EVENTS_guildEmojiUpdate = this.sequelize.define('EVENTS_guildEmojiUpdate', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
          emojiId: { type: DataTypes.BIGINT, allowNull: true },
          oldEmojiPath: { type: DataTypes.TEXT, allowNull: false },
          newEmojiPath: { type: DataTypes.TEXT, allowNull: false },
          datetime: { type: DataTypes.BIGINT, allowNull: true },
          executorId: { type: DataTypes.BIGINT, allowNull: true }
        }, {
          tableName: 'EVENTS_guildEmojiUpdate',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
    
        this.EVENTS_guildMemberAdd = this.sequelize.define('EVENTS_guildMemberAdd', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
          userid: { type: DataTypes.BIGINT, allowNull: true },
          joinedAt: { type: DataTypes.BIGINT, allowNull: true },
          nickname: { type: DataTypes.STRING(64), allowNull: true },
          datetime: { type: DataTypes.BIGINT, allowNull: true }
        }, {
          tableName: 'EVENTS_guildMemberAdd',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
    
        this.EVENTS_guildMemberAvailable = this.sequelize.define('EVENTS_guildMemberAvailable', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
        }, {
          tableName: 'EVENTS_guildMemberAvailable',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_guildMemberRemove = this.sequelize.define('EVENTS_guildMemberRemove', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
          userid: { type: DataTypes.BIGINT, allowNull: true },
          leftAt: { type: DataTypes.BIGINT, allowNull: true },
          datetime: { type: DataTypes.BIGINT, allowNull: true }
        }, {
          tableName: 'EVENTS_guildMemberRemove',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_guildMembersChunk = this.sequelize.define('EVENTS_guildMembersChunk', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
        }, {
          tableName: 'EVENTS_guildMembersChunk',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_guildMemberUpdate = this.sequelize.define('EVENTS_guildMemberUpdate', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
          oldNickname: { type: DataTypes.STRING(50), allowNull: true },
          oldDisplayName: { type: DataTypes.STRING(50), allowNull: true },
          oldDisplayAvatarURL: { type: DataTypes.STRING(50), allowNull: true },
          oldRoles: { type: DataTypes.JSON, allowNull: true },
          newNickname: { type: DataTypes.STRING(50), allowNull: true },
          newDisplayName: { type: DataTypes.STRING(50), allowNull: true },
          newDisplayAvatarURL: { type: DataTypes.STRING(50), allowNull: true },
          userid: { type: DataTypes.BIGINT, allowNull: true },
          datetime: { type: DataTypes.BIGINT, allowNull: true },
          newRoles: { type: DataTypes.JSON, allowNull: true }
        }, {
          tableName: 'EVENTS_guildMemberUpdate',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_interactionCreate = this.sequelize.define('EVENTS_interactionCreate', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
          type: { type: DataTypes.INTEGER, allowNull: true },
          datetime: { type: DataTypes.BIGINT, allowNull: true },
          commandName: { type: DataTypes.STRING(50), allowNull: true },
          executorId: { type: DataTypes.BIGINT, allowNull: true },
          channelid: { type: DataTypes.BIGINT, allowNull: true }
        }, {
          tableName: 'EVENTS_interactionCreate',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_inviteCreate = this.sequelize.define('EVENTS_inviteCreate', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
          code: { type: DataTypes.TEXT, allowNull: false },
          channelid: { type: DataTypes.BIGINT, allowNull: true },
          userid: { type: DataTypes.BIGINT, allowNull: true },
          maxUses: { type: DataTypes.INTEGER, allowNull: true },
          expiresAt: { type: DataTypes.BIGINT, allowNull: true },
          executorId: { type: DataTypes.INTEGER, allowNull: true },
          datetime: { type: DataTypes.BIGINT, allowNull: true }
        }, {
          tableName: 'EVENTS_inviteCreate',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_inviteDelete = this.sequelize.define('EVENTS_inviteDelete', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
          code: { type: DataTypes.TEXT, allowNull: false },
          channelid: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
          executorId: { type: DataTypes.INTEGER, allowNull: true },
          datetime: { type: DataTypes.BIGINT, allowNull: true }
        }, {
          tableName: 'EVENTS_inviteDelete',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_messageCreate = this.sequelize.define('EVENTS_messageCreate', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
          datetime: { type: DataTypes.BIGINT, allowNull: true },
          messageId: { type: DataTypes.BIGINT, allowNull: true },
          channelId: { type: DataTypes.BIGINT, allowNull: true },
          userId: { type: DataTypes.BIGINT, allowNull: true },
          attachments: { type: DataTypes.JSON, allowNull: true },
          content: { type: DataTypes.TEXT, allowNull: false },
          isDelete: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
          isReply: { type: DataTypes.INTEGER, allowNull: true },
          replyToMessageId: { type: DataTypes.BIGINT, allowNull: true },
          deleteDatetime: { type: DataTypes.BIGINT, allowNull: true }
        }, {
          tableName: 'EVENTS_messageCreate',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_messageDelete = this.sequelize.define('EVENTS_messageDelete', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
          messageId: { type: DataTypes.BIGINT, allowNull: true },
          datetime: { type: DataTypes.BIGINT, allowNull: true },
          executorId: { type: DataTypes.BIGINT, allowNull: true }
        }, {
          tableName: 'EVENTS_messageDelete',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_messageDeleteBulk = this.sequelize.define('EVENTS_messageDeleteBulk', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
          channelId: { type: DataTypes.BIGINT, allowNull: true },
          deletedMessages: { type: DataTypes.INTEGER, allowNull: true },
          executorId: { type: DataTypes.BIGINT, allowNull: true },
          datetime: { type: DataTypes.BIGINT, allowNull: true }
        }, {
          tableName: 'EVENTS_messageDeleteBulk',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_messageReactionAdd = this.sequelize.define('EVENTS_messageReactionAdd', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
          reactionId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
          messageId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
          userId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
          datetime: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
          name: { type: DataTypes.STRING(50), allowNull: true }
        }, {
          tableName: 'EVENTS_messageReactionAdd',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_messageReactionRemove = this.sequelize.define('EVENTS_messageReactionRemove', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
          reactionId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
          messageId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
          userId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
          datetime: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
          name: { type: DataTypes.STRING(50), allowNull: true }
        }, {
          tableName: 'EVENTS_messageReactionRemove',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_messageReactionRemoveAll = this.sequelize.define('EVENTS_messageReactionRemoveAll', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
        }, {
          tableName: 'EVENTS_messageReactionRemoveAll',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_messageReactionRemoveAll = this.sequelize.define('EVENTS_messageReactionRemoveAll', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
        }, {
          tableName: 'EVENTS_messageReactionRemoveAll',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_messageReactionRemoveEmoji = this.sequelize.define('EVENTS_messageReactionRemoveEmoji', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
        }, {
          tableName: 'EVENTS_messageReactionRemoveEmoji',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_messageUpdate = this.sequelize.define('EVENTS_messageUpdate', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
          userId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
          messageId: { type: DataTypes.BIGINT, allowNull: true },
          newContent: { type: DataTypes.TEXT, allowNull: true },
          oldContent: { type: DataTypes.TEXT, allowNull: true },
          datetime: { type: DataTypes.BIGINT, allowNull: true },
          attachments: { type: DataTypes.JSON, allowNull: true },
          isReply: { type: DataTypes.INTEGER, allowNull: true },
          replyToMessageId: { type: DataTypes.BIGINT, allowNull: true }
        }, {
          tableName: 'EVENTS_messageUpdate',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_presenceUpdate = this.sequelize.define('EVENTS_presenceUpdate', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
        }, {
          tableName: 'EVENTS_presenceUpdate',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_roleCreate = this.sequelize.define('EVENTS_roleCreate', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
          roleId: { type: DataTypes.BIGINT, allowNull: true },
          name: { type: DataTypes.STRING(64), allowNull: true },
          color: { type: DataTypes.TEXT, allowNull: false },
          permissions: { type: DataTypes.JSON, allowNull: true },
          datetime: { type: DataTypes.BIGINT, allowNull: true },
          executorId: { type: DataTypes.BIGINT, allowNull: true }
        }, {
          tableName: 'EVENTS_roleCreate',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_roleUpdate = this.sequelize.define('EVENTS_roleUpdate', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
          roleId: { type: DataTypes.BIGINT, allowNull: true },
          name: { type: DataTypes.STRING(64), allowNull: true },
          color: { type: DataTypes.TEXT, allowNull: false },
          permissions: { type: DataTypes.JSON, allowNull: true },
          datetime: { type: DataTypes.BIGINT, allowNull: true },
          isDelete: { type: DataTypes.TINYINT, allowNull: true },
          executorId: { type: DataTypes.BIGINT, allowNull: true },
          deleteDatetime: { type: DataTypes.BIGINT, allowNull: true }
        }, {
          tableName: 'EVENTS_roleUpdate',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_threadCreate = this.sequelize.define('EVENTS_threadCreate', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
        }, {
          tableName: 'EVENTS_threadCreate',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_threadDelete = this.sequelize.define('EVENTS_threadDelete', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
        }, {
          tableName: 'EVENTS_threadDelete',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_threadListSync = this.sequelize.define('EVENTS_threadListSync', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
        }, {
          tableName: 'EVENTS_threadListSync',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_threadMemberUpdate = this.sequelize.define('EVENTS_threadMemberUpdate', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
        }, {
          tableName: 'EVENTS_threadMemberUpdate',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_threadUpdate = this.sequelize.define('EVENTS_threadUpdate', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
        }, {
          tableName: 'EVENTS_threadUpdate',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_typingStart = this.sequelize.define('EVENTS_typingStart', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
        }, {
          tableName: 'EVENTS_typingStart',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_typingStop = this.sequelize.define('EVENTS_typingStop', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
        }, {
          tableName: 'EVENTS_typingStop',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_userUpdate = this.sequelize.define('EVENTS_userUpdate', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
        }, {
          tableName: 'EVENTS_userUpdate',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_voiceServerUpdate = this.sequelize.define('EVENTS_voiceServerUpdate', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
        }, {
          tableName: 'EVENTS_voiceServerUpdate',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.EVENTS_voiceStateUpdate = this.sequelize.define('EVENTS_voiceStateUpdate', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
          userId: { type: DataTypes.BIGINT, allowNull: true },
          oldChannelId: { type: DataTypes.BIGINT, allowNull: true },
          newChannelId: { type: DataTypes.BIGINT, allowNull: true },
          oldServerMute: { type: DataTypes.TINYINT, allowNull: true },
          newServerMute: { type: DataTypes.TINYINT, allowNull: true },
          oldServerDeaf: { type: DataTypes.TINYINT, allowNull: true },
          newServerDeaf: { type: DataTypes.TINYINT, allowNull: true },
          oldStream: { type: DataTypes.TINYINT, allowNull: true },
          newStream: { type: DataTypes.TINYINT, allowNull: true },
          oldCam: { type: DataTypes.TINYINT, allowNull: true },
          newCam: { type: DataTypes.TINYINT, allowNull: true },
          oldClientMute: { type: DataTypes.TINYINT, allowNull: true },
          newClientMute: { type: DataTypes.TINYINT, allowNull: true },
          oldClientDeaf: { type: DataTypes.TINYINT, allowNull: true },
          newClientDeaf: { type: DataTypes.TINYINT, allowNull: true },
          eventType: { type: DataTypes.INTEGER, allowNull: true },
          executorId: { type: DataTypes.BIGINT, allowNull: true },
          datetime: { type: DataTypes.BIGINT, allowNull: true }
        }, {
          tableName: 'EVENTS_voiceStateUpdate',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.STATE_voiceLeft = this.sequelize.define('STATE_voiceLeft', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
          channelid: { type: DataTypes.BIGINT, allowNull: true },
          userid: { type: DataTypes.BIGINT, allowNull: true },
          date: { type: DataTypes.BIGINT, allowNull: true }
        }, {
          tableName: 'STATE_voiceLeft',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.STATS_voiceJoin = this.sequelize.define('STATS_voiceJoin', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
          userid: { type: DataTypes.BIGINT, allowNull: true },
          channelid: { type: DataTypes.BIGINT, allowNull: true },
          date: { type: DataTypes.BIGINT, allowNull: true }
        }, {
          tableName: 'STATS_voiceJoin',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
        this.STATS_voiceSessions = this.sequelize.define('STATS_voiceSessions', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
          type: { type: DataTypes.INTEGER, allowNull: true },
          start: { type: DataTypes.BIGINT, allowNull: true },
          end: { type: DataTypes.BIGINT, allowNull: true },
          userid: { type: DataTypes.BIGINT, allowNull: true }
        }, {
          tableName: 'STATS_voiceSessions',
          timestamps: false,
          charset: this.charset,
          collate: this.collate
        });
    
      }
    
    
    /**
     * Adds a single entry to a model. If the operation fails, it logs an error.
     * @param {Model} model - The model to add the entry to.
     * @param {Object} data - The data to add to the model.
     * @param {string} description - A description of the type of event being added.
     */
    async addEntry(model, data, description) {
        try {
            await model.create(data);
            console.log(`${description} event added.`);
        } catch (error) {
            console.error(`Error adding ${description} event:`, error);
        }
    }
}

const argv = yargs
    .command('init', 'Initialize the bot configuration', {
        token: { alias: 't', type: 'string', demandOption: true, description: 'Discord bot token' },
        id: { alias: 'i', type: 'string', demandOption: true, description: 'Client ID' },
        guid: { alias: 'g', type: 'string', demandOption: true, description: 'Guild ID' },
        rsrole: { alias: 'r', type: 'string', demandOption: true, description: 'Restricted Role ID' },
    })
    .command('invite', 'Generate a Discord bot invite link', {})

    .command('bdd', 'Configure the database', {
        host: { type: 'string', description: 'Database host address', demandOption: false },
        dbname: { type: 'string', description: 'Database name', demandOption: false },
        dbport: { type: 'number', description: 'Database port', demandOption: false },
        dbuser: { type: 'string', description: 'Database username', demandOption: false },
        dbpass: { type: 'string', description: 'Database password', demandOption: false },
        create: { type: 'boolean', description: 'Create tables after connection', default: false }
    }, (args) => handleBddCommand(args))
    .command('bdd-test', 'Test the database connection', {}, () => {
        testDatabaseConnection();
    })
    .command('help', `
        Available Commands:

        invite
            - Generate an invite link for the Discord bot.

        bdd --host "host" --dbname "dbname" --dbport dbport --dbuser "username" --dbpass "password" --create (optional)
            - Set database connection variables in config.env. If --create is specified, connect and create tables.

        bdd-test
            - Test the database connection.

        -help
            - Display this help information.
        `)
    .help()
    .argv;

/**
 * Updates a variable in a .env file. If the variable does not exist, adds it.
 * @param {string} key - The key to update in the .env file
 * @param {string} value - The value to set the key to
 * @param {string} configPath - The path to the .env file to update
 */
function updateEnvVariable(key, value) {
    let configContent = fs.readFileSync(configPath, 'utf8');
    const regex = new RegExp(`^${key}=.*$`, 'm');

    if (configContent.match(regex)) {

        configContent = configContent.replace(regex, `${key}="${value}"`);
        console.log(`Updated '${key}' in config.env.`);
    } else {
        configContent += `\n${key}= "${value}" `;
        console.log(`Added '${key}' to config.env.`);
    }

    fs.writeFileSync(configPath, configContent, 'utf8');
}



/**
 * Creates all tables in the database if they don't already exist.
 *
 * This operation will delete all existing tables and data in the database.
 *
 * @returns {Promise<void>}
 */
function createTables(host, dbname, dbport, dbuser, bpass) {
    const db = new Database(host, dbname, dbport, dbuser, bpass);
    if (!db.sequelize) {
        console.log('Unable to connect to the database. Please check your parameters.');
        return;
    }

    db.sequelize.sync({ force: true })
        .then(() => console.log('Tables have been created successfully in the database.'))
        .catch((error) => console.error('Error creating tables:', error));
}

/**
 * Generates an invite link for your bot to invite it to a server.
 *
 * @returns {void}
 */
function generateInviteLink() {
    const clientId = process.env.discord_cqd_cid;

    if (!clientId) {
        console.error('Client ID is missing in environment variables. Please initialize the bot configuration using cn init.');
        return;
    }

    const inviteLink = `https://discord.com/oauth2/authorize?client_id=${clientId}&scope=bot&permissions=1099511627775`;
    console.log(`Invite your bot to a server using the following link:\n${inviteLink}`);
}


/**
 * Handles the database command for the bot configuration.
 *
 * This function updates the database connection variables in the config.env file and
 * creates the tables in the database if the `--create` flag is provided.
 *
 * @param {Object} args - The command line arguments.
 * @param {string} args.host - The hostname for the database.
 * @param {string} args.dbname - The name of the database.
 * @param {string} args.dbport - The port for the database.
 * @param {string} args.dbuser - The username for the database.
 * @param {string} args.dbpass - The password for the database.
 * @param {boolean} [args.create=false] - Create the tables in the database if true.
 * @returns {void}
 */
function handleBddCommand(args) {

    console.log('Configuring database connection variables...');

    updateEnvVariable('dbhost', args.host);
    updateEnvVariable('dbname', args.dbname);
    updateEnvVariable('dbport', args.dbport);
    updateEnvVariable('dbuser', args.dbuser);
    updateEnvVariable('dbpass', args.dbpass);

    console.log('Database connection parameters have been updated in config.env.');

    if (args.create) {
        createTables(args.host, args.dbname, args.dbport, args.dbuser, args.dbpass);
    }
}

/**
 * Tests the database connection using the parameters in the config.env file.
 *
 * If the connection is successful, it logs a success message to the console.
 * If the connection fails, it logs an error message to the console with the error.
 *
 * @returns {void}
 */

function testDatabaseConnection() {
    const db = new Database();
    if (!db.sequelize) {
        console.log('Unable to connect to the database. Please check your parameters.');
        return;
    }

    db.sequelize.authenticate()
        .then(() => console.log('Database connection successful.'))
        .catch((error) => console.error('Failed to connect to the database:', error));
}

function initBotConfig(token, clientId, guid) {

    console.log('Initializing bot configuration...');

    updateEnvVariable('discord_cqd_token', token);
    updateEnvVariable('discord_cqd_cid', clientId);
    updateEnvVariable('discord_guid', guid);

    console.log('Bot configuration initialized successfully.');
}

if (argv._[0] === 'init') {
    if (argv.token && argv.id && argv.guid) {
        initBotConfig(argv.token, argv.id, argv.guid);
    } else {
        console.log('Please provide all required options: --token, --id, --guid');
    }
} else if (argv._[0] === 'invite') {
    generateInviteLink();
} else if (argv._[0] === 'bdd') {
    // handleBddCommand(argv);
} else if (argv._[0] === 'help') {
    console.log('Use `cn help` to see available commands.');
} else {
    console.log('Invalid command. Use `cn help` to see available commands.');
}