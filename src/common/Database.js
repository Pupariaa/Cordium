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
    global.database = true
    if (!process.env.dbname || !process.env.dbhost || !process.env.dbuser || !process.env.dbpass || !process.env.dbport) {
      console.warn('START: Missing database parameters, no saved data, do cn --bdd help');
      this.connected = false;
      return;
    }

    this.sequelize = new Sequelize(process.env.dbname, process.env.dbuser, process.env.dbpass, {
      host: process.env.dbhost,
      port: process.env.dbport,
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
    // DATA_channels Table
    this.DATA_channels = this.sequelize.define('DATA_channels', {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      name: { type: DataTypes.STRING(64), allowNull: false, defaultValue: '' },
      channelId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
      parentId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
      permissions: { type: DataTypes.JSON, allowNull: false },
      datetime: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
      channelType: { type: DataTypes.BOOLEAN, allowNull: true },
    }, { tableName: 'DATA_channels', timestamps: false });

    // EVENTS_channelCreate Table
    this.EVENTS_channelCreate = this.sequelize.define('EVENTS_channelCreate', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      channelId: { type: DataTypes.BIGINT, allowNull: true },
      name: { type: DataTypes.STRING(64), allowNull: true },
      permissions: { type: DataTypes.JSON, allowNull: true },
      datetime: { type: DataTypes.JSON, allowNull: true },
      isDelete: { type: DataTypes.BOOLEAN, allowNull: true },
      executorId: { type: DataTypes.BIGINT, allowNull: true },
    }, { tableName: 'EVENTS_channelCreate', timestamps: false });

    // EVENTS_channelDelete Table
    this.EVENTS_channelDelete = this.sequelize.define('EVENTS_channelDelete', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      channelId: { type: DataTypes.BIGINT, allowNull: true },
      name: { type: DataTypes.STRING(64), allowNull: true },
      permissions: { type: DataTypes.JSON, allowNull: true },
      datetime: { type: DataTypes.JSON, allowNull: true },
      isDelete: { type: DataTypes.BOOLEAN, allowNull: true },
      executorId: { type: DataTypes.BIGINT, allowNull: true },
    }, { tableName: 'EVENTS_channelDelete', timestamps: false });

    // EVENTS_channelUpdate Table
    this.EVENTS_channelUpdate = this.sequelize.define('EVENTS_channelUpdate', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      channelId: { type: DataTypes.BIGINT, allowNull: true },
      oldName: { type: DataTypes.STRING(64), allowNull: true },
      newName: { type: DataTypes.STRING(64), allowNull: true },
      oldPermissions: { type: DataTypes.JSON, allowNull: true },
      newPermissions: { type: DataTypes.JSON, allowNull: true },
      datetime: { type: DataTypes.JSON, allowNull: true },
      isDelete: { type: DataTypes.BOOLEAN, allowNull: true },
      executorId: { type: DataTypes.BIGINT, allowNull: true },
    }, { tableName: 'EVENTS_channelUpdate', timestamps: false });

    // EVENTS_emojiCreate Table
    this.EVENTS_emojiCreate = this.sequelize.define('EVENTS_emojiCreate', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      emojiId: { type: DataTypes.BIGINT, allowNull: true },
      emojiPath: { type: DataTypes.TEXT, allowNull: true },
      datetime: { type: DataTypes.BIGINT, allowNull: true },
      executorId: { type: DataTypes.BIGINT, allowNull: true },
    }, { tableName: 'EVENTS_emojiCreate', timestamps: false });

    // EVENTS_emojiUpdate Table
    this.EVENTS_emojiUpdate = this.sequelize.define('EVENTS_emojiUpdate', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      emojiId: { type: DataTypes.BIGINT, allowNull: true },
      oldEmojiPath: { type: DataTypes.TEXT, allowNull: true },
      newEmojiPath: { type: DataTypes.TEXT, allowNull: true },
      datetime: { type: DataTypes.BIGINT, allowNull: true },
      executorId: { type: DataTypes.BIGINT, allowNull: true },
    }, { tableName: 'EVENTS_emojiUpdate', timestamps: false });

    // EVENTS_guidBanAdd Table
    this.EVENTS_guidBanAdd = this.sequelize.define('EVENTS_guidBanAdd', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userid: { type: DataTypes.BIGINT, allowNull: true },
      reason: { type: DataTypes.STRING(255), allowNull: true },
      datetime: { type: DataTypes.BIGINT, allowNull: true },
      executorId: { type: DataTypes.BIGINT, allowNull: true },
    }, { tableName: 'EVENTS_guidBanAdd', timestamps: false });

    // EVENTS_guildMemberAdd Table
    this.EVENTS_guildMemberAdd = this.sequelize.define('EVENTS_guildMemberAdd', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userid: { type: DataTypes.BIGINT, allowNull: true },
      joinedAt: { type: DataTypes.BIGINT, allowNull: true },
      nickname: { type: DataTypes.STRING(64), allowNull: true },
      datetime: { type: DataTypes.BIGINT, allowNull: true },

    }, { tableName: 'EVENTS_guildMemberAdd', timestamps: false });

    // EVENTS_guildMemberRemove Table
    this.EVENTS_guildMemberRemove = this.sequelize.define('EVENTS_guildMemberRemove', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userid: { type: DataTypes.BIGINT, allowNull: true },
      leftedAt: { type: DataTypes.BIGINT, allowNull: true },
      datetime: { type: DataTypes.BIGINT, allowNull: true },

    }, { tableName: 'EVENTS_guildMemberRemove', timestamps: false });

    // EVENTS_interactionCreate Table
    this.EVENTS_interactionCreate = this.sequelize.define('EVENTS_interactionCreate', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      type: { type: DataTypes.INTEGER, allowNull: true },
      datetime: { type: DataTypes.BIGINT, allowNull: true },
      commandName: { type: DataTypes.STRING(50), allowNull: true },
      executorId: { type: DataTypes.BIGINT, allowNull: true },
      channelid: { type: DataTypes.BIGINT, allowNull: true },
    }, { tableName: 'EVENTS_interactionCreate', timestamps: false });

    // EVENTS_inviteCreate Table
    this.EVENTS_inviteCreate = this.sequelize.define('EVENTS_inviteCreate', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      code: { type: DataTypes.TEXT, allowNull: true },
      channelid: { type: DataTypes.BIGINT, allowNull: true },
      userid: { type: DataTypes.BIGINT, allowNull: true },
      maxUses: { type: DataTypes.INTEGER, allowNull: true },
      expiresAt: { type: DataTypes.BIGINT, allowNull: true },
      executorId: { type: DataTypes.INTEGER, allowNull: true },
      datetime: { type: DataTypes.BIGINT, allowNull: true },


    }, { tableName: 'EVENTS_inviteCreate', timestamps: false });

    // EVENTS_inviteDelete Table
    this.EVENTS_inviteDelete = this.sequelize.define('EVENTS_inviteDelete', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      code: { type: DataTypes.TEXT, allowNull: false },
      channelid: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
      executorId: { type: DataTypes.INTEGER, allowNull: true },
      datetime: { type: DataTypes.BIGINT, allowNull: true },


    }, { tableName: 'EVENTS_inviteDelete', timestamps: false });

    // EVENTS_messageCreate Table
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

    // EVENTS_messageDelete Table
    this.EVENTS_messageDelete = this.sequelize.define('EVENTS_messageDelete', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      messageId: { type: DataTypes.BIGINT, allowNull: true },
      datetime: { type: DataTypes.BIGINT, allowNull: true },
      executorId: { type: DataTypes.INTEGER, allowNull: true },
    }, { tableName: 'EVENTS_messageDelete', timestamps: false });

    // EVENTS_messageDeleteBulk Table
    this.EVENTS_messageDeleteBulk = this.sequelize.define('EVENTS_messageDeleteBulk', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      channelId: { type: DataTypes.BIGINT, allowNull: true },
      deletedMessages: { type: DataTypes.INTEGER, allowNull: true },
      executorId: { type: DataTypes.BIGINT, allowNull: true },
      datetime: { type: DataTypes.BIGINT, allowNull: true },
    }, { tableName: 'EVENTS_messageDeleteBulk', timestamps: false });

    // EVENTS_messageReactionAdd Table
    this.EVENTS_messageReactionAdd = this.sequelize.define('EVENTS_messageReactionAdd', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      reactionId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
      messageId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
      userId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
      datetime: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
      name: { type: DataTypes.STRING(64), allowNull: true },

    }, { tableName: 'EVENTS_messageReactionAdd', timestamps: false });

    // EVENTS_messageReactionRemove Table
    this.EVENTS_messageReactionRemove = this.sequelize.define('EVENTS_messageReactionRemove', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      reactionId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
      messageId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
      userId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
      datetime: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
      name: { type: DataTypes.STRING(64), allowNull: true },

    }, { tableName: 'EVENTS_messageReactionRemove', timestamps: false });

    // EVENTS_messageUpdate Table
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

    // EVENTS_roleCreate Table
    this.EVENTS_roleCreate = this.sequelize.define('EVENTS_roleCreate', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      roleId: { type: DataTypes.BIGINT, allowNull: true },
      name: { type: DataTypes.STRING(64), allowNull: true },
      color: { type: DataTypes.TEXT, allowNull: true },
      permissions: { type: DataTypes.JSON, allowNull: true },
      datetime: { type: DataTypes.BIGINT, allowNull: true },
      executorId: { type: DataTypes.BIGINT, allowNull: true },
    }, { tableName: 'EVENTS_roleCreate', timestamps: false });

    // EVENTS_roleUpdate Table
    this.EVENTS_roleUpdate = this.sequelize.define('EVENTS_roleUpdate', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      roleId: { type: DataTypes.BIGINT, allowNull: true },
      name: { type: DataTypes.STRING(64), allowNull: true },
      color: { type: DataTypes.TEXT, allowNull: true },
      permissions: { type: DataTypes.JSON, allowNull: true },
      datetime: { type: DataTypes.BIGINT, allowNull: true },
      isDelete: { type: DataTypes.BOOLEAN, allowNull: true },
      executorId: { type: DataTypes.BIGINT, allowNull: true },
      deleteDatetime: { type: DataTypes.BIGINT, allowNull: true },
    }, { tableName: 'EVENTS_roleUpdate', timestamps: false });

    // EVENTS_voiceStateUpdate Table
    this.EVENTS_voiceStateUpdate = this.sequelize.define('EVENTS_voiceStateUpdate', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.BIGINT, allowNull: true },
      oldChannelId: { type: DataTypes.BIGINT, allowNull: true },
      newChannelId: { type: DataTypes.BIGINT, allowNull: true },



      oldServerMute: { type: DataTypes.BOOLEAN, allowNull: true },
      newServerMute: { type: DataTypes.BOOLEAN, allowNull: true },

      oldServerDeaf: { type: DataTypes.BOOLEAN, allowNull: true },
      newServerDeaf: { type: DataTypes.BOOLEAN, allowNull: true },

      oldStream: { type: DataTypes.BOOLEAN, allowNull: true },
      newStream: { type: DataTypes.BOOLEAN, allowNull: true },

      oldCam: { type: DataTypes.BOOLEAN, allowNull: true },
      newCam: { type: DataTypes.BOOLEAN, allowNull: true },

      oldClientMute: { type: DataTypes.BOOLEAN, allowNull: true },
      newClientMute: { type: DataTypes.BOOLEAN, allowNull: true },

      oldClientDeaf: { type: DataTypes.BOOLEAN, allowNull: true },
      newClientDeaf: { type: DataTypes.BOOLEAN, allowNull: true },

      eventType: { type: DataTypes.INTEGER, allowNull: true },
      executorId: { type: DataTypes.BIGINT, allowNull: true },
      datetime: { type: DataTypes.BIGINT, allowNull: true },

    }, { tableName: 'EVENTS_voiceStateUpdate', timestamps: false });

    // STATE_voiceLeft Table
    this.STATE_voiceLeft = this.sequelize.define('STATE_voiceLeft', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      channelid: { type: DataTypes.BIGINT, allowNull: true },
      userid: { type: DataTypes.BIGINT, allowNull: true },
      date: { type: DataTypes.BIGINT, allowNull: true },
    }, { tableName: 'STATE_voiceLeft', timestamps: false });

    // STATS_globalServer Table
    this.STATS_globalServer = this.sequelize.define('STATS_globalServer', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      mb_count: { type: DataTypes.INTEGER, allowNull: true },
      mb_voice: { type: DataTypes.INTEGER, allowNull: true },
      mb_voice_cam: { type: DataTypes.INTEGER, allowNull: true },
      mb_voice_stream: { type: DataTypes.INTEGER, allowNull: true },
      mb_server_mute: { type: DataTypes.INTEGER, allowNull: true },
      mb_server_deaf: { type: DataTypes.INTEGER, allowNull: true },
      mb_client_mute: { type: DataTypes.INTEGER, allowNull: true },
      mb_client_deaf: { type: DataTypes.INTEGER, allowNull: true },
      mb_online: { type: DataTypes.INTEGER, allowNull: true },
      mb_dnd: { type: DataTypes.INTEGER, allowNull: true },
      mb_idle: { type: DataTypes.INTEGER, allowNull: true },
      mb_offline: { type: DataTypes.INTEGER, allowNull: true },
      date: { type: DataTypes.BIGINT, allowNull: true },
    }, { tableName: 'STATS_globalServer', timestamps: false });
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
    try {
      if (this.connected) {
        await model.create(data);
      }
    } catch (error) {
      console.error(`Error adding ${description} entry:`, error);
    }
  }


  /**
   * Adds a new entry to the EVENTS_guildMemberAdd table.
   * @param {object} data - The data to add to the table.
   * @return {Promise<void>}
   */
  async addGuildMemberAdd(data) {
    await this.addEntry(this.EVENTS_guildMemberAdd, data, 'Guild Member Add');
  }

  /**
   * Adds a new entry to the EVENTS_guildMemberRemove table.
   * @param {object} data - The data to add to the table.
   * @return {Promise<void>}
   */
  async addGuildMemberRemove(data) {
    await this.addEntry(this.EVENTS_guildMemberRemove, data, 'Guild Member Remove');
  }

  /**
   * Adds a new entry to the EVENTS_messageCreate table.
   * @param {object} data - The data to add to the table.
   * @return {Promise<void>}
   */
  async addMessageCreate(data) {
    await this.addEntry(this.EVENTS_messageCreate, data, 'Message Create');
  }

  /**
   * Adds a new entry to the EVENTS_voiceStateUpdate table.
   * @param {object} data - The data to add to the table.
   * @return {Promise<void>}
   */
  async addVoiceStateUpdate(data) {
    await this.addEntry(this.EVENTS_voiceStateUpdate, data, 'Voice State Update');
  }

  /**
   * Adds a new entry to the EVENTS_interactionCreate table.
   * @param {object} data - The data to add to the table.
   * @return {Promise<void>}
   */
  async addInteractionCreate(data) {
    await this.addEntry(this.EVENTS_interactionCreate, data, 'Interaction Create');
  }

  /**
   * Adds a new entry to the EVENTS_guidBanAdd table.
   * @param {object} data - The data to add to the table.
   * @return {Promise<void>}
   */
  async addGuidBanAdd(data) {
    await this.addEntry(this.EVENTS_guidBanAdd, data, 'Guild Ban Add');
  }

  /**
   * Adds a new entry to the EVENTS_inviteCreate table.
   * @param {object} data - The data to add to the table.
   * @return {Promise<void>}
   */
  async addInviteCreate(data) {
    await this.addEntry(this.EVENTS_inviteCreate, data, 'Invite Create');
  }

  /**
   * Adds a new entry to the EVENTS_inviteDelete table.
   * @param {object} data - The data to add to the table.
   * @return {Promise<void>}
   */
  async addInviteDelete(data) {
    await this.addEntry(this.EVENTS_inviteDelete, data, 'Invite Delete');
  }

  /**
   * Adds a new entry to the EVENTS_messageUpdate table.
   * @param {object} data - The data to add to the table.
   * @return {Promise<void>}
   */
  async addMessageUpdate(data) {
    await this.addEntry(this.EVENTS_messageUpdate, data, 'Message Update');
  }

  /**
   * Adds a new entry to the EVENTS_roleCreate table.
   * @param {object} data - The data to add to the table.
   * @return {Promise<void>}
   */
  async addRoleCreate(data) {
    await this.addEntry(this.EVENTS_roleCreate, data, 'Role Create');
  }

  /**
   * Adds a new entry to the EVENTS_roleUpdate table.
   * @param {object} data - The data to add to the table.
   * @return {Promise<void>}
   */
  async addRoleUpdate(data) {
    await this.addEntry(this.EVENTS_roleUpdate, data, 'Role Update');
  }

  /**
   * Adds a new entry to the EVENTS_messageDelete table.
   * @param {object} data - The data to add to the table.
   * @return {Promise<void>}
   */
  async addMessageDelete(data) {
    await this.addEntry(this.EVENTS_messageDelete, data, 'Message Delete');
  }

  /**
   * Adds a new entry to the EVENTS_channelCreate table.
   * @param {object} data - The data to add to the table.
   * @return {Promise<void>}
   */
  async addChannelCreate(data) {
    await this.addEntry(this.EVENTS_channelCreate, data, 'Channel Create');
  }


  /**
   * Adds a new entry to the EVENTS_channelDelete table.
   * @param {object} data - The data to add to the table.
   * @return {Promise<void>}
   */
  async addChannelDelete(data) {
    await this.addEntry(this.EVENTS_channelDelete, data, 'Channel Delete');
  }

  /**
   * Adds a new entry to the EVENTS_channelUpdate table.
   * @param {object} data - The data to add to the table.
   * @return {Promise<void>}
   */
  async addChannelUpdate(data) {
    await this.addEntry(this.EVENTS_channelUpdate, data, 'Channel Update');
  }

  /**
   * Adds a new entry to the EVENTS_guidBanAdd table.
   * @param {object} data - The data to add to the table.
   * @return {Promise<void>}
   */
  async addGuidBanRemove(data) {
    await this.addEntry(this.EVENTS_guidBanAdd, data, 'Guild Ban Remove');
  }

  /**
   * Adds a new entry to the EVENTS_emojiCreate table.
   * @param {object} data - The data to add to the table.
   * @return {Promise<void>}
   */
  async addEmojiCreate(data) {
    await this.addEntry(this.EVENTS_emojiCreate, data, 'Emoji Create');
  }

  /**
   * Adds a new entry to the EVENTS_emojiUpdate table.
   * @param {object} data - The data to add to the table.
   * @return {Promise<void>}
   */
  async addEmojiUpdate(data) {
    await this.addEntry(this.EVENTS_emojiUpdate, data, 'Emoji Update');
  }

  /**
   * Adds a new entry to the EVENTS_messageReactionAdd table.
   * @param {object} data - The data to add to the table.
   * @return {Promise<void>}
   */
  async addMessageReactionAdd(data) {
    await this.addEntry(this.EVENTS_messageReactionAdd, data, 'Message Reaction Add');
  }

  /**
   * Adds a new entry to the EVENTS_messageReactionRemove table.
   * @param {object} data - The data to add to the table.
   * @return {Promise<void>}
   */
  async addMessageReactionRemove(data) {
    await this.addEntry(this.EVENTS_messageReactionRemove, data, 'Message Reaction Remove');
  }

  /**
   * Adds a new entry to the EVENTS_messageDeleteBulk table.
   * @param {object} data - The data to add to the table.
   * @return {Promise<void>}
   */
  async addMessageDeleteBulk(data) {
    await this.addEntry(this.EVENTS_messageDeleteBulk, data, 'Message Delete Bulk');
  }

  /**
   * Adds a new entry to the EVENTS_channelCreate table.
   * @param {object} data - The data to add to the table.
   * @return {Promise<void>}
   */
  async addThreadCreate(data) {
    await this.addEntry(this.EVENTS_channelCreate, data, 'Thread Create');
  }

  /**
   * Adds a new entry to the EVENTS_channelDelete table with the given data, tagged as a 'Thread Delete' event.
   * @param {object} data - The data to add to the table.
   * @return {Promise<void>}
   */
  async addThreadDelete(data) {
    await this.addEntry(this.EVENTS_channelDelete, data, 'Thread Delete');
  }

  /**
   * Adds a new entry to the EVENTS_channelUpdate table with the given data, tagged as a 'Thread Update' event.
   * @param {object} data - The data to add to the table.
   * @return {Promise<void>}
   */
  async addThreadUpdate(data) {
    await this.addEntry(this.EVENTS_channelUpdate, data, 'Thread Update');
  }

  /**
   * Adds a new entry to the EVENTS_emojiCreate table with the given data, tagged as a 'Sticker Create' event.
   * @param {object} data - The data to add to the table.
   * @return {Promise<void>}
   */
  async addStickerCreate(data) {
    await this.addEntry(this.EVENTS_emojiCreate, data, 'Sticker Create');
  }

  /**
   * Adds a new entry to the EVENTS_emojiUpdate table with the given data, tagged as a 'Sticker Delete' event.
   * @param {object} data - The data to add to the table.
   * @return {Promise<void>}
   */
  async addStickerDelete(data) {
    await this.addEntry(this.EVENTS_emojiUpdate, data, 'Sticker Delete');
  }

}

module.exports = Database;
