const { Sequelize, DataTypes, Op } = require('sequelize'); // Assurez-vous que Sequelize et Op sont importés


class Database {
  /**
   * The constructor for the Database class.
   *
   * Checks for all database environment variables. If any of them are missing, it logs a warning
   * and sets `this.connected` to false.
   *
   * Otherwise, creates a new Sequelize instance with the provided database environment variables.
   * Also defines all the models used in the database.
   *
   * Finally, attempts to authenticate the database connection and logs the result.
   *
   * @return {void}
   */
  constructor() {
    this.connected = true;
    this.charset = "utf8mb4";
    this.collate = "utf8mb4_unicode_ci";
    global.database = true
    if (!process.env.db_name || !process.env.db_host || !process.env.db_user || !process.env.db_pass || !process.env.db_port) {
      console.warn('START: Missing database parameters, no saved data, do cn --bdd help');
      this.connected = false;
      return;
    }

    this.sequelize = new Sequelize(process.env.db_name, process.env.db_user, process.env.db_pass, {
      host: process.env.db_host,
      port: process.env.db_port,
      dialect: 'mysql',
      logging: false
    });

    this.defineModels();
    this.sequelize.authenticate()
      .then(() => console.success('START: Database connection successful'))
      .catch(err => {
        global.databse = false
        console.error('START: Unable to connect to database', err)
      });




  }

  /**
   * Defines all the models used in the database.
   *
   * This function is called by the constructor and defines all the models used in the database.
   *
   * @return {void}
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
  get(name) {
    this.models = {
      'EVENTS_userUpdate': this.EVENTS_userUpdate,
      'EVENTS_voiceServerUpdate': this.EVENTS_voiceServerUpdate,
      'EVENTS_voiceStateUpdate': this.EVENTS_voiceStateUpdate,
      'EVENTS_channelUpdate': this.EVENTS_channelUpdate,
      'EVENTS_channelDelete': this.EVENTS_channelDelete,
      'EVENTS_channelPinsUpdate': this.EVENTS_channelPinsUpdate,
      'EVENTS_roleUpdate': this.EVENTS_roleUpdate,
      'EVENTS_roleDelete': this.EVENTS_roleDelete,
      'EVENTS_roleCreate': this.EVENTS_roleCreate,
      'EVENTS_roleUpdate': this.EVENTS_roleUpdate,
      'EVENTS_threadUpdate': this.EVENTS_threadUpdate,
      'EVENTS_threadDelete': this.EVENTS_threadDelete,
      'EVENTS_threadCreate': this.EVENTS_threadCreate,
      'EVENTS_threadListSync': this.EVENTS_threadListSync,
      'EVENTS_threadMembersUpdate': this.EVENTS_threadMemberUpdate,
      'EVENTS_typingStart': this.EVENTS_typingStart,
      'EVENTS_typingStop': this.EVENTS_typingStop,
      'EVENTS_presenceUpdate': this.EVENTS_presenceUpdate,
      'EVENTS_messageCreate': this.EVENTS_messageCreate,
      'EVENTS_messageUpdate': this.EVENTS_messageUpdate,
      'EVENTS_messageDelete': this.EVENTS_messageDelete,
      'EVENTS_messageDeleteBulk': this.EVENTS_messageDeleteBulk,
      'EVENTS_messageReactionAdd': this.EVENTS_messageReactionAdd,
      'EVENTS_messageReactionRemove': this.EVENTS_messageReactionRemove,
      'EVENTS_messageReactionRemoveAll': this.EVENTS_messageReactionRemoveAll,
      'EVENTS_messageReactionRemoveEmoji': this.EVENTS_messageReactionRemoveEmoji,
      'EVENTS_interactionCreate': this.EVENTS_interactionCreate,
      'EVENTS_inviteCreate': this.EVENTS_inviteCreate,
      'EVENTS_inviteDelete': this.EVENTS_inviteDelete,
      'EVENTS_guildMemberAdd': this.EVENTS_guildMemberAdd,
      'EVENTS_guildMemberRemove': this.EVENTS_guildMemberRemove,
      'EVENTS_guildMemberUpdate': this.EVENTS_guildMemberUpdate,
      'EVENTS_guildMembersChunk': this.EVENTS_guildMembersChunk,
      'EVENTS_guildMemberAvailable': this.EVENTS_guildMemberAvailable,
      'EVENTS_guildEmojiUpdate': this.EVENTS_guildEmojiUpdate,
      'EVENTS_guildEmojiDelete': this.EVENTS_guildEmojiDelete,
      'EVENTS_guildEmojiCreate': this.EVENTS_guildEmojiCreate,
    }
    return this.models[name];
  }


  /**
   * Finds all voice state updates made by a user.
   * @param {string} userId The ID of the user.
   * @returns {Promise<Array<import('sequelize').Instance<VoiceStateUpdate>>>} The found voice state updates.
   * @throws {Error} If the database query fails.
   */
  async getVoiceStateUpdatesByUserId(userId) {
    try {
      const updates = await this.EVENTS_voiceStateUpdate.findAll({
        where: {
          userId: userId
        }
      });
      return updates;
    } catch (error) {
      throw error;
    }
  }
  /**
   * Retrieves all messages sent by the given user in the given channels in the given date range.
   * 
   * @param {string} userId - The user ID to query messages for.
   * @param {number} startDate - The start of the date range to query messages for.
   * @param {number} endDate - The end of the date range to query messages for.
   * @param {string[]} channelIds - The channels to query messages for.
   * @returns {Promise<Message[]>} - The messages sent by the user in the given channels in the given date range.
   */
  async getMessagesBetweenDates(userId, startDate, endDate, channelIds) {

    try {
      if (!channelIds || channelIds.length === 0) {
        return [];
      }
      const messages = await this.EVENTS_messageCreate.findAll({
        where: {
          channelId: channelIds,
          datetime: {
            [Op.between]: [startDate, endDate]
          }
        },
        order: [['datetime', 'ASC']]
      });

      return messages;
    } catch (error) {
      throw error;
    }
  }


  /**
   * Adds a single entry to a model. If the operation fails, it logs an error.
   * @param {Model} model - The model to add the entry to.
   * @param {Object} data - The data to add to the model.
   * @param {string} description - A description of the type of event being added.
   */
  async addEntry(model, data, description) {
    if (!this.get(model)) {
      return console.error('cannot get model:', model)
    }

    try {
      if (this.connected) {
        await this.get(model).create(data);
      }
    } catch (error) {
      console.error(`Error adding ${description} entry:`, error);
    }
  }
}

module.exports = Database;
