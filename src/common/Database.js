const { Sequelize, DataTypes } = require('sequelize');

class Database {
  constructor() {

    if (!process.env.dbname || !process.env.dbhost || !process.env.dbuser || !process.env.dbpass || !process.env.dbport) {
      console.warn('START: Missing database parameters, no saved data, do cn --bdd help');
      return;
    }

    this.sequelize = new Sequelize(process.env.dbname, process.env.dbuser, process.env.dbpass, {
      host: process.env.dbhost,
      port: process.env.dbport,
      dialect: 'mysql',
    });

    this.defineModels();
    this.sequelize.authenticate()
      .then(() => console.success('START: Database connection successful'))
      .catch(err => console.error('START: Unable to connect to database', err));
  }

  defineModels() {
    this.DATA_channels = this.sequelize.define('DATA_channels', {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      name: { type: DataTypes.STRING(64), allowNull: false, defaultValue: '' },
      channelId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
      parentId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
      permissions: { type: DataTypes.JSON, allowNull: false },
      datetime: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
      channelType: { type: DataTypes.BOOLEAN, allowNull: true },
    }, { tableName: 'DATA_channels', timestamps: false });

    this.EVENTS_channelCreate = this.sequelize.define('EVENTS_channelCreate', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      roleId: { type: DataTypes.BIGINT, allowNull: true },
      name: { type: DataTypes.STRING(64), allowNull: true },
      color: { type: DataTypes.TEXT, allowNull: true },
      permissions: { type: DataTypes.JSON, allowNull: true },
      datetime: { type: DataTypes.JSON, allowNull: true },
      isDelete: { type: DataTypes.BOOLEAN, allowNull: true },
      userid: { type: DataTypes.BIGINT, allowNull: true },
    }, { tableName: 'EVENTS_channelCreate', timestamps: false });

    this.EVENTS_emojiCreate = this.sequelize.define('EVENTS_emojiCreate', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      emojiId: { type: DataTypes.BIGINT, allowNull: true },
      emojiPath: { type: DataTypes.TEXT, allowNull: true },
      datetime: { type: DataTypes.BIGINT, allowNull: true },
    }, { tableName: 'EVENTS_emojiCreate', timestamps: false });

    this.EVENTS_emojiUpdate = this.sequelize.define('EVENTS_emojiUpdate', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      emojiId: { type: DataTypes.BIGINT, allowNull: true },
      oldEmojiPath: { type: DataTypes.TEXT, allowNull: true },
      newEmojiPath: { type: DataTypes.TEXT, allowNull: true },
      datetime: { type: DataTypes.BIGINT, allowNull: true },
    }, { tableName: 'EVENTS_emojiUpdate', timestamps: false });

    this.EVENTS_guidBanAdd = this.sequelize.define('EVENTS_guidBanAdd', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userid: { type: DataTypes.BIGINT, allowNull: true },
      reason: { type: DataTypes.STRING(255), allowNull: true },
      datetime: { type: DataTypes.BIGINT, allowNull: true },
    }, { tableName: 'EVENTS_guidBanAdd', timestamps: false });

    this.EVENTS_guildMemberAdd = this.sequelize.define('EVENTS_guildMemberAdd', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userid: { type: DataTypes.BIGINT, allowNull: true },
      joinedAt: { type: DataTypes.BIGINT, allowNull: true },
      nickname: { type: DataTypes.STRING(64), allowNull: true },
    }, { tableName: 'EVENTS_guildMemberAdd', timestamps: false });

    this.EVENTS_guildMemberRemove = this.sequelize.define('EVENTS_guildMemberRemove', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userid: { type: DataTypes.BIGINT, allowNull: true },
      leftedAt: { type: DataTypes.BIGINT, allowNull: true },
    }, { tableName: 'EVENTS_guildMemberRemove', timestamps: false });

    this.EVENTS_interactionCreate = this.sequelize.define('EVENTS_interactionCreate', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      type: { type: DataTypes.INTEGER, allowNull: true },
      datetime: { type: DataTypes.BIGINT, allowNull: true },
      commandName: { type: DataTypes.STRING(50), allowNull: true },
      userid: { type: DataTypes.BIGINT, allowNull: true },
      channelid: { type: DataTypes.BIGINT, allowNull: true },
    }, { tableName: 'EVENTS_interactionCreate', timestamps: false });

    this.EVENTS_inviteCreate = this.sequelize.define('EVENTS_inviteCreate', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      code: { type: DataTypes.TEXT, allowNull: true },
      channelid: { type: DataTypes.BIGINT, allowNull: true },
      userid: { type: DataTypes.BIGINT, allowNull: true },
      maxUses: { type: DataTypes.INTEGER, allowNull: true },
      expiresAt: { type: DataTypes.BIGINT, allowNull: true },
    }, { tableName: 'EVENTS_inviteCreate', timestamps: false });

    this.EVENTS_inviteDelete = this.sequelize.define('EVENTS_inviteDelete', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      code: { type: DataTypes.TEXT, allowNull: false },
      channelid: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
    }, { tableName: 'EVENTS_inviteDelete', timestamps: false });

    this.EVENTS_messageCreate = this.sequelize.define('EVENTS_messageCreate', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      datetime: { type: DataTypes.BIGINT, allowNull: true },
      messageId: { type: DataTypes.BIGINT, allowNull: true },
      channelId: { type: DataTypes.BIGINT, allowNull: true },
      userId: { type: DataTypes.BIGINT, allowNull: true },
      attachments: { type: DataTypes.JSON, allowNull: true },
      content: { type: DataTypes.TEXT, allowNull: true },
      isDelete: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
      isReply: { type: DataTypes.INTEGER, allowNull: true },
      replyToMessageId: { type: DataTypes.BIGINT, allowNull: true },
      deleteDatetime: { type: DataTypes.BIGINT, allowNull: true },
    }, { tableName: 'EVENTS_messageCreate', timestamps: false });

    this.EVENTS_messageDelete = this.sequelize.define('EVENTS_messageDelete', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      messageId: { type: DataTypes.BIGINT, allowNull: true },
      datetime: { type: DataTypes.BIGINT, allowNull: true },
    }, { tableName: 'EVENTS_messageDelete', timestamps: false });

    this.EVENTS_messageDeleteBulk = this.sequelize.define('EVENTS_messageDeleteBulk', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      channelId: { type: DataTypes.BIGINT, allowNull: true },
      deletedMessages: { type: DataTypes.INTEGER, allowNull: true },
      userId: { type: DataTypes.BIGINT, allowNull: true },
      datetime: { type: DataTypes.BIGINT, allowNull: true },
    }, { tableName: 'EVENTS_messageDeleteBulk', timestamps: false });

    this.EVENTS_messageReactionAdd = this.sequelize.define('EVENTS_messageReactionAdd', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      reactionId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
      messageId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
      userId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
      datetime: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
    }, { tableName: 'EVENTS_messageReactionAdd', timestamps: false });

    this.EVENTS_messageReactionRemove = this.sequelize.define('EVENTS_messageReactionRemove', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      reactionId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
      messageId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
      userId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
      datetime: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
    }, { tableName: 'EVENTS_messageReactionRemove', timestamps: false });

    this.EVENTS_messageUpdate = this.sequelize.define('EVENTS_messageUpdate', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
      messageId: { type: DataTypes.BIGINT, allowNull: true },
      newContent: { type: DataTypes.TEXT, allowNull: true },
      oldContent: { type: DataTypes.TEXT, allowNull: true },
      datetime: { type: DataTypes.BIGINT, allowNull: true },
      attachments: { type: DataTypes.JSON, allowNull: true },
      isReply: { type: DataTypes.INTEGER, allowNull: true },
      replyToMessageId: { type: DataTypes.BIGINT, allowNull: true },
    }, { tableName: 'EVENTS_messageUpdate', timestamps: false });

    this.EVENTS_roleCreate = this.sequelize.define('EVENTS_roleCreate', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      roleId: { type: DataTypes.BIGINT, allowNull: true },
      name: { type: DataTypes.STRING(64), allowNull: true },
      color: { type: DataTypes.TEXT, allowNull: true },
      permissions: { type: DataTypes.JSON, allowNull: true },
      datetime: { type: DataTypes.BIGINT, allowNull: true },
      userid: { type: DataTypes.BIGINT, allowNull: true },
    }, { tableName: 'EVENTS_roleCreate', timestamps: false });

    this.EVENTS_roleUpdate = this.sequelize.define('EVENTS_roleUpdate', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      roleId: { type: DataTypes.BIGINT, allowNull: true },
      name: { type: DataTypes.STRING(64), allowNull: true },
      color: { type: DataTypes.TEXT, allowNull: true },
      permissions: { type: DataTypes.JSON, allowNull: true },
      datetime: { type: DataTypes.BIGINT, allowNull: true },
      isDelete: { type: DataTypes.BOOLEAN, allowNull: true },
      userid: { type: DataTypes.BIGINT, allowNull: true },
      deleteDatetime: { type: DataTypes.BIGINT, allowNull: true },
    }, { tableName: 'EVENTS_roleUpdate', timestamps: false });

    this.EVENTS_voiceStateUpdate = this.sequelize.define('EVENTS_voiceStateUpdate', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.BIGINT, allowNull: true },
      oldChannelId: { type: DataTypes.BIGINT, allowNull: true },
      newChannelId: { type: DataTypes.BIGINT, allowNull: true },
      oldServerDeaf: { type: DataTypes.BOOLEAN, allowNull: true },
      oldServerMute: { type: DataTypes.BOOLEAN, allowNull: true },
      newServerDeaf: { type: DataTypes.BOOLEAN, allowNull: true },
      newServerMute: { type: DataTypes.BOOLEAN, allowNull: true },
      oldStream: { type: DataTypes.BOOLEAN, allowNull: true },
      oldCam: { type: DataTypes.BOOLEAN, allowNull: true },
      newStream: { type: DataTypes.BOOLEAN, allowNull: true },
      newCam: { type: DataTypes.BOOLEAN, allowNull: true },
      eventType: { type: DataTypes.BOOLEAN, allowNull: true },
    }, { tableName: 'EVENTS_voiceStateUpdate', timestamps: false });
  }

  // Fonctions d'insertion pour chaque modèle
  async addChannelCreate(data) {
    await this.addEntry(this.EVENTS_channelCreate, data, 'Channel Create');
  }

  async addEmojiCreate(data) {
    await this.addEntry(this.EVENTS_emojiCreate, data, 'Emoji Create');
  }

  async addEmojiUpdate(data) {
    await this.addEntry(this.EVENTS_emojiUpdate, data, 'Emoji Update');
  }

  async addGuidBanAdd(data) {
    await this.addEntry(this.EVENTS_guidBanAdd, data, 'Guild Ban Add');
  }

  async addGuildMemberAdd(data) {
    await this.addEntry(this.EVENTS_guildMemberAdd, data, 'Guild Member Add');
  }

  async addGuildMemberRemove(data) {
    await this.addEntry(this.EVENTS_guildMemberRemove, data, 'Guild Member Remove');
  }

  async addInteractionCreate(data) {
    await this.addEntry(this.EVENTS_interactionCreate, data, 'Interaction Create');
  }

  async addInviteCreate(data) {
    await this.addEntry(this.EVENTS_inviteCreate, data, 'Invite Create');
  }

  async addInviteDelete(data) {
    await this.addEntry(this.EVENTS_inviteDelete, data, 'Invite Delete');
  }

  async addMessageCreate(data) {
    await this.addEntry(this.EVENTS_messageCreate, data, 'Message Create');
  }

  async addMessageDelete(data) {
    await this.addEntry(this.EVENTS_messageDelete, data, 'Message Delete');
  }

  async addMessageDeleteBulk(data) {
    await this.addEntry(this.EVENTS_messageDeleteBulk, data, 'Message Delete Bulk');
  }

  async addMessageReactionAdd(data) {
    await this.addEntry(this.EVENTS_messageReactionAdd, data, 'Message Reaction Add');
  }

  async addMessageReactionRemove(data) {
    await this.addEntry(this.EVENTS_messageReactionRemove, data, 'Message Reaction Remove');
  }

  async addMessageUpdate(data) {
    await this.addEntry(this.EVENTS_messageUpdate, data, 'Message Update');
  }

  async addRoleCreate(data) {
    await this.addEntry(this.EVENTS_roleCreate, data, 'Role Create');
  }

  async addRoleUpdate(data) {
    await this.addEntry(this.EVENTS_roleUpdate, data, 'Role Update');
  }

  async addVoiceStateUpdate(data) {
    await this.addEntry(this.EVENTS_voiceStateUpdate, data, 'Voice State Update');
  }

  async addEntry(model, data, description) {
    try {
      await model.create(data);
    } catch (error) {

    }
  }
}

module.exports = Database;
