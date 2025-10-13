'use strict';

const path = require('path');
const { Events } = require('discord.js');
const { Sequelize, DataTypes, Op } = require('sequelize');
const { set } = require(global.utilsPath);

class EventsDatabase {
	constructor() {
		this.charset = "utf8mb4";
		this.collate = "utf8mb4_unicode_ci";
		global.eventsDatabaseOnline = false;
	}

	init() {
		return new Promise((resolve, reject) => {
			const dbType = process.env.db_type || 'mysql';

			if (dbType === 'sqlite') {
				const fs = require('fs');
				const dbPath = process.env.db_path || path.join(process.cwd(), 'src', 'cordium.sqlite');
				const dbDir = path.dirname(dbPath);

				if (!fs.existsSync(dbDir)) {
					fs.mkdirSync(dbDir, { recursive: true });
				}

				this.sequelize = new Sequelize({
					dialect: 'sqlite',
					storage: dbPath,
					logging: false
				});
				console.report(`Using SQLite database at: ${dbPath}`);
			} else {
				if (!process.env.db_name || !process.env.db_host || !process.env.db_user || !process.env.db_pass || !process.env.db_port) {
					console.reportWarn('Database connection parameters are missing. Cannot connect. Nothing will be recorded');
					return reject(new Error('Database connection parameters missing'));
				}

				this.sequelize = new Sequelize(process.env.db_name, process.env.db_user, process.env.db_pass, {
					host: process.env.db_host,
					port: process.env.db_port,
					dialect: 'mysql',
					logging: false
				});
				console.report(`Using MySQL database: ${process.env.db_name}`);
			}

			this.defineModels();


			this.sequelize.authenticate()
				.then(async (db) => {
					console.report('Database authenticated successfully');
					global.eventsDatabaseOnline = true;
					const syncResult = await this.syncAllTables();
					console.report(`Database ready: ${syncResult.success} tables synchronized`);
					resolve(db);
				})
				.catch(err => {
					console.reportError('Database authentication failed:', err.message);
					console.error(err);
					reject(err);
				})

		})
	}

	#defineEventModel(event, columns, tableMetadata) {
		const isSQLite = this.sequelize.options.dialect === 'sqlite';
		const JsonType = isSQLite ? DataTypes.TEXT : DataTypes.JSON;
		const updatedMetadata = { ...tableMetadata };

		if (isSQLite) {
			delete updatedMetadata.charset;
			delete updatedMetadata.collate;
		}

		const updatedColumns = { ...columns };
		Object.keys(updatedColumns).forEach(key => {
			if (updatedColumns[key].type === DataTypes.JSON) {
				updatedColumns[key] = { ...updatedColumns[key], type: JsonType };
			}
		});

		const eventName = typeof event === 'string' ? event : event.toString();
		const modelName = `EVENTS_${eventName}`;
		this[modelName] = this.sequelize.define(modelName, updatedColumns, updatedMetadata);
	}

	defineModels() {
		const isSQLite = this.sequelize.options.dialect === 'sqlite';
		const JsonType = isSQLite ? DataTypes.TEXT : DataTypes.JSON;
		const tableOptions = (tableName, extraOptions = {}) => {
			const opts = {
				tableName,
				timestamps: false,
				...extraOptions
			};
			if (!isSQLite) {
				opts.charset = this.charset;
				opts.collate = this.collate;
			}
			return opts;
		};

		this.events = this.sequelize.define('events', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
			event_name: { type: DataTypes.STRING(64), allowNull: false },
			user_id: { type: DataTypes.STRING(32), allowNull: true },
			user_name: { type: DataTypes.STRING(255), allowNull: true },
			user_avatar: { type: DataTypes.STRING(512), allowNull: true },
			guild_id: { type: DataTypes.STRING(32), allowNull: true },
			channel_id: { type: DataTypes.STRING(32), allowNull: true },
			message_id: { type: DataTypes.STRING(32), allowNull: true },
			event_data: { type: JsonType, allowNull: true },
			timestamp: { type: DataTypes.BIGINT, allowNull: false }
		}, tableOptions('events', {
			indexes: [
				{ fields: ['event_name'] },
				{ fields: ['user_id'] },
				{ fields: ['timestamp'] },
				{ fields: ['event_name', 'timestamp'] }
			]
		}));

		this.DATA_channels = this.sequelize.define('DATA_channels', {
			id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
			name: { type: DataTypes.STRING(64), allowNull: false, defaultValue: '' },
			channelId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
			parentId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
			permissions: { type: JsonType, allowNull: false },
			datetime: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
			channelType: { type: DataTypes.TINYINT, allowNull: true }
		}, tableOptions('DATA_channels'));
		this.EVENTS_channelCreate = this.sequelize.define('EVENTS_channelCreate', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
			channelId: { type: DataTypes.BIGINT, allowNull: true },
			name: { type: DataTypes.STRING(64), allowNull: true },
			permissions: { type: JsonType, allowNull: true },
			datetime: { type: DataTypes.BIGINT, allowNull: true },
			isDelete: { type: DataTypes.TINYINT, allowNull: true },
			executorId: { type: DataTypes.BIGINT, allowNull: true }
		}, tableOptions('EVENTS_channelCreate'));
		this.EVENTS_channelPinsUpdate = this.sequelize.define('EVENTS_channelPinsUpdate', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
		}, tableOptions('EVENTS_channelPinsUpdate'));
		this.EVENTS_guildBanAdd = this.sequelize.define('EVENTS_guildBanAdd', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
			userid: { type: DataTypes.BIGINT, allowNull: true },
			reason: { type: DataTypes.STRING(255), allowNull: true },
			datetime: { type: DataTypes.BIGINT, allowNull: true },
			executorId: { type: DataTypes.BIGINT, allowNull: true }
		}, tableOptions('EVENTS_guildBanAdd'));
		this.EVENTS_guildEmojiCreate = this.sequelize.define('EVENTS_guildEmojiCreate', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
			emojiId: { type: DataTypes.BIGINT, allowNull: true },
			emojiPath: { type: DataTypes.TEXT, allowNull: false },
			datetime: { type: DataTypes.BIGINT, allowNull: true },
			executorId: { type: DataTypes.BIGINT, allowNull: true }
		}, tableOptions('EVENTS_guildEmojiCreate'));
		this.EVENTS_guildEmojiDelete = this.sequelize.define('EVENTS_guildEmojiDelete', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
			emojiId: { type: DataTypes.BIGINT, allowNull: true },
			oldEmojiPath: { type: DataTypes.TEXT, allowNull: true },
			newEmojiPath: { type: DataTypes.TEXT, allowNull: true },
			datetime: { type: DataTypes.BIGINT, allowNull: true },
			executorId: { type: DataTypes.BIGINT, allowNull: true }
		}, tableOptions('EVENTS_guildEmojiDelete', {
			indexes: [{ using: 'BTREE', fields: ['id'] }]
		}));
		this.EVENTS_guildEmojiUpdate = this.sequelize.define('EVENTS_guildEmojiUpdate', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
			emojiId: { type: DataTypes.BIGINT, allowNull: true },
			oldEmojiPath: { type: DataTypes.TEXT, allowNull: false },
			newEmojiPath: { type: DataTypes.TEXT, allowNull: false },
			datetime: { type: DataTypes.BIGINT, allowNull: true },
			executorId: { type: DataTypes.BIGINT, allowNull: true }
		}, tableOptions('EVENTS_guildEmojiUpdate'));
		this.EVENTS_guildMemberAdd = this.sequelize.define('EVENTS_guildMemberAdd', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
			userid: { type: DataTypes.BIGINT, allowNull: true },
			joinedAt: { type: DataTypes.BIGINT, allowNull: true },
			nickname: { type: DataTypes.STRING(64), allowNull: true },
			datetime: { type: DataTypes.BIGINT, allowNull: true }
		}, tableOptions('EVENTS_guildMemberAdd'));
		this.EVENTS_guildMemberAvailable = this.sequelize.define('EVENTS_guildMemberAvailable', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
		}, tableOptions('EVENTS_guildMemberAvailable'));
		this.EVENTS_guildMemberRemove = this.sequelize.define('EVENTS_guildMemberRemove', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
			userid: { type: DataTypes.BIGINT, allowNull: true },
			leftAt: { type: DataTypes.BIGINT, allowNull: true },
			datetime: { type: DataTypes.BIGINT, allowNull: true }
		}, tableOptions('EVENTS_guildMemberRemove'));
		this.EVENTS_guildMembersChunk = this.sequelize.define('EVENTS_guildMembersChunk', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
		}, tableOptions('EVENTS_guildMembersChunk'));
		this.EVENTS_guildMemberUpdate = this.sequelize.define('EVENTS_guildMemberUpdate', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
			oldNickname: { type: DataTypes.STRING(50), allowNull: true },
			oldDisplayName: { type: DataTypes.STRING(50), allowNull: true },
			oldDisplayAvatarURL: { type: DataTypes.STRING(50), allowNull: true },
			oldRoles: { type: JsonType, allowNull: true },
			newNickname: { type: DataTypes.STRING(50), allowNull: true },
			newDisplayName: { type: DataTypes.STRING(50), allowNull: true },
			newDisplayAvatarURL: { type: DataTypes.STRING(50), allowNull: true },
			userid: { type: DataTypes.BIGINT, allowNull: true },
			datetime: { type: DataTypes.BIGINT, allowNull: true },
			newRoles: { type: JsonType, allowNull: true }
		}, tableOptions('EVENTS_guildMemberUpdate'));
		this.EVENTS_interactionCreate = this.sequelize.define('EVENTS_interactionCreate', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
			type: { type: DataTypes.INTEGER, allowNull: true },
			datetime: { type: DataTypes.BIGINT, allowNull: true },
			commandName: { type: DataTypes.STRING(50), allowNull: true },
			executorId: { type: DataTypes.BIGINT, allowNull: true },
			channelid: { type: DataTypes.BIGINT, allowNull: true }
		}, tableOptions('EVENTS_interactionCreate'));
		this.EVENTS_inviteCreate = this.sequelize.define('EVENTS_inviteCreate', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
			code: { type: DataTypes.TEXT, allowNull: false },
			channelid: { type: DataTypes.BIGINT, allowNull: true },
			userid: { type: DataTypes.BIGINT, allowNull: true },
			maxUses: { type: DataTypes.INTEGER, allowNull: true },
			expiresAt: { type: DataTypes.BIGINT, allowNull: true },
			executorId: { type: DataTypes.INTEGER, allowNull: true },
			datetime: { type: DataTypes.BIGINT, allowNull: true }
		}, tableOptions('EVENTS_inviteCreate'));
		this.EVENTS_inviteDelete = this.sequelize.define('EVENTS_inviteDelete', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
			code: { type: DataTypes.TEXT, allowNull: false },
			channelid: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
			executorId: { type: DataTypes.INTEGER, allowNull: true },
			datetime: { type: DataTypes.BIGINT, allowNull: true }
		}, tableOptions('EVENTS_inviteDelete'));
		this.EVENTS_messageCreate = this.sequelize.define('EVENTS_messageCreate', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
			datetime: { type: DataTypes.BIGINT, allowNull: true },
			messageId: { type: DataTypes.BIGINT, allowNull: true },
			channelId: { type: DataTypes.BIGINT, allowNull: true },
			userId: { type: DataTypes.BIGINT, allowNull: true },
			attachments: { type: JsonType, allowNull: true },
			content: { type: DataTypes.TEXT, allowNull: false },
			isDelete: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
			isReply: { type: DataTypes.INTEGER, allowNull: true },
			replyToMessageId: { type: DataTypes.BIGINT, allowNull: true },
			deleteDatetime: { type: DataTypes.BIGINT, allowNull: true }
		}, tableOptions('EVENTS_messageCreate'));
		this.EVENTS_messageDelete = this.sequelize.define('EVENTS_messageDelete', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
			messageId: { type: DataTypes.BIGINT, allowNull: true },
			datetime: { type: DataTypes.BIGINT, allowNull: true },
			executorId: { type: DataTypes.BIGINT, allowNull: true }
		}, tableOptions('EVENTS_messageDelete'));
		this.EVENTS_messageDeleteBulk = this.sequelize.define('EVENTS_messageDeleteBulk', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
			channelId: { type: DataTypes.BIGINT, allowNull: true },
			deletedMessages: { type: DataTypes.INTEGER, allowNull: true },
			executorId: { type: DataTypes.BIGINT, allowNull: true },
			datetime: { type: DataTypes.BIGINT, allowNull: true }
		}, tableOptions('EVENTS_messageDeleteBulk'));
		this.EVENTS_messageReactionAdd = this.sequelize.define('EVENTS_messageReactionAdd', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
			reactionId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
			messageId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
			userId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
			datetime: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
			name: { type: DataTypes.STRING(50), allowNull: true }
		}, tableOptions('EVENTS_messageReactionAdd'));
		this.EVENTS_messageReactionRemove = this.sequelize.define('EVENTS_messageReactionRemove', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
			reactionId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
			messageId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
			userId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
			datetime: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
			name: { type: DataTypes.STRING(50), allowNull: true }
		}, tableOptions('EVENTS_messageReactionRemove'));
		this.EVENTS_messageReactionRemoveAll = this.sequelize.define('EVENTS_messageReactionRemoveAll', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
		}, tableOptions('EVENTS_messageReactionRemoveAll'));
		this.EVENTS_messageReactionRemoveEmoji = this.sequelize.define('EVENTS_messageReactionRemoveEmoji', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
		}, tableOptions('EVENTS_messageReactionRemoveEmoji'));
		this.EVENTS_messageUpdate = this.sequelize.define('EVENTS_messageUpdate', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
			userId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
			messageId: { type: DataTypes.BIGINT, allowNull: true },
			newContent: { type: DataTypes.TEXT, allowNull: true },
			oldContent: { type: DataTypes.TEXT, allowNull: true },
			datetime: { type: DataTypes.BIGINT, allowNull: true },
			attachments: { type: JsonType, allowNull: true },
			isReply: { type: DataTypes.INTEGER, allowNull: true },
			replyToMessageId: { type: DataTypes.BIGINT, allowNull: true }
		}, tableOptions('EVENTS_messageUpdate'));
		this.EVENTS_presenceUpdate = this.sequelize.define('EVENTS_presenceUpdate', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
		}, tableOptions('EVENTS_presenceUpdate'));
		this.EVENTS_roleCreate = this.sequelize.define('EVENTS_roleCreate', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
			roleId: { type: DataTypes.BIGINT, allowNull: true },
			name: { type: DataTypes.STRING(64), allowNull: true },
			color: { type: DataTypes.TEXT, allowNull: false },
			permissions: { type: JsonType, allowNull: true },
			datetime: { type: DataTypes.BIGINT, allowNull: true },
			executorId: { type: DataTypes.BIGINT, allowNull: true }
		}, tableOptions('EVENTS_roleCreate'));
		this.EVENTS_roleUpdate = this.sequelize.define('EVENTS_roleUpdate', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
			roleId: { type: DataTypes.BIGINT, allowNull: true },
			name: { type: DataTypes.STRING(64), allowNull: true },
			color: { type: DataTypes.TEXT, allowNull: false },
			permissions: { type: JsonType, allowNull: true },
			datetime: { type: DataTypes.BIGINT, allowNull: true },
			isDelete: { type: DataTypes.TINYINT, allowNull: true },
			executorId: { type: DataTypes.BIGINT, allowNull: true },
			deleteDatetime: { type: DataTypes.BIGINT, allowNull: true }
		}, tableOptions('EVENTS_roleUpdate'));
		this.EVENTS_threadCreate = this.sequelize.define('EVENTS_threadCreate', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
		}, tableOptions('EVENTS_threadCreate'));
		this.EVENTS_threadDelete = this.sequelize.define('EVENTS_threadDelete', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
		}, tableOptions('EVENTS_threadDelete'));
		this.EVENTS_threadListSync = this.sequelize.define('EVENTS_threadListSync', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
		}, tableOptions('EVENTS_threadListSync'));
		this.EVENTS_threadMemberUpdate = this.sequelize.define('EVENTS_threadMemberUpdate', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
		}, tableOptions('EVENTS_threadMemberUpdate'));
		this.EVENTS_threadUpdate = this.sequelize.define('EVENTS_threadUpdate', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
		}, tableOptions('EVENTS_threadUpdate'));
		this.EVENTS_typingStart = this.sequelize.define('EVENTS_typingStart', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
		}, tableOptions('EVENTS_typingStart'));
		this.EVENTS_typingStop = this.sequelize.define('EVENTS_typingStop', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
		}, tableOptions('EVENTS_typingStop'));
		this.EVENTS_userUpdate = this.sequelize.define('EVENTS_userUpdate', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
		}, tableOptions('EVENTS_userUpdate'));
		this.EVENTS_voiceServerUpdate = this.sequelize.define('EVENTS_voiceServerUpdate', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false }
		}, tableOptions('EVENTS_voiceServerUpdate'));
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
		}, tableOptions('EVENTS_voiceStateUpdate'));
		this.STATE_voiceLeft = this.sequelize.define('STATE_voiceLeft', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
			channelid: { type: DataTypes.BIGINT, allowNull: true },
			userid: { type: DataTypes.BIGINT, allowNull: true },
			date: { type: DataTypes.BIGINT, allowNull: true }
		}, tableOptions('STATE_voiceLeft'));
		this.STATS_voiceJoin = this.sequelize.define('STATS_voiceJoin', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
			userid: { type: DataTypes.BIGINT, allowNull: true },
			channelid: { type: DataTypes.BIGINT, allowNull: true },
			date: { type: DataTypes.BIGINT, allowNull: true }
		}, tableOptions('STATS_voiceJoin'));
		this.STATS_voiceSessions = this.sequelize.define('STATS_voiceSessions', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
			type: { type: DataTypes.INTEGER, allowNull: true },
			start: { type: DataTypes.BIGINT, allowNull: true },
			end: { type: DataTypes.BIGINT, allowNull: true },
			userid: { type: DataTypes.BIGINT, allowNull: true }
		}, tableOptions('STATS_voiceSessions'));

	}

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

	async addEntry(event, data) {
		try {
			// if (global.eventsDatabaseOnline) await this[`EVENTS_${event}`].create(data);
		} catch (err) {
			console.reportError(`Error adding ${data} entry:`, err);
		}
	}

	async syncAllTables() {
		const allModels = Object.keys(this).filter(key =>
			this[key] &&
			typeof this[key] === 'object' &&
			this[key].tableName
		);

		console.report(`Synchronizing ${allModels.length} database tables...`);

		let successCount = 0;
		let errorCount = 0;
		const errors = [];

		for (const modelKey of allModels) {
			try {
				const tableName = this[modelKey].tableName;
				await this[modelKey].sync({ alter: true });
				successCount++;
			} catch (err) {
				errorCount++;
				const tableName = this[modelKey].tableName;
				errors.push({ table: tableName, error: err.message });
				console.reportError(`Error syncing ${tableName}:`, err.message);
			}
		}

		console.report(`Tables synchronized: ${successCount} successful, ${errorCount} errors`);

		if (errors.length > 0) {
			console.reportWarn('Failed tables:', errors.map(e => e.table).join(', '));
		}

		return { success: successCount, errors: errorCount, errorDetails: errors };
	}

	getAllTableNames() {
		return Object.keys(this)
			.filter(key => this[key] && typeof this[key] === 'object' && this[key].tableName)
			.map(key => this[key].tableName);
	}
}

module.exports = EventsDatabase;
