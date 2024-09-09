#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
require('dotenv').config({ path: path.join(__dirname, '../config.env') });

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

    constructor() {
        if (!process.env.dbname || !process.env.dbhost || !process.env.dbuser || !process.env.dbpass || !process.env.dbport) {
            console.log('Database connection parameters are missing. Cannot connect. Nothing will be recorded.');
            return;
        }

        this.sequelize = new Sequelize(process.env.dbname, process.env.dbuser, process.env.dbpass, {
            host: process.env.dbhost,
            port: process.env.dbport,
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
            datetime: { type: DataTypes.BIGINT, allowNull: true },
            isDelete: { type: DataTypes.BOOLEAN, allowNull: true },
            executorId: { type: DataTypes.BIGINT, allowNull: true },
        }, { tableName: 'EVENTS_channelCreate', timestamps: false });
    
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
        }, { tableName: 'EVENTS_guildMemberAdd', timestamps: false });
    
        // EVENTS_guildMemberRemove Table
        this.EVENTS_guildMemberRemove = this.sequelize.define('EVENTS_guildMemberRemove', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            userid: { type: DataTypes.BIGINT, allowNull: true },
            leftedAt: { type: DataTypes.BIGINT, allowNull: true },
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
        }, { tableName: 'EVENTS_inviteCreate', timestamps: false });
    
        // EVENTS_inviteDelete Table
        this.EVENTS_inviteDelete = this.sequelize.define('EVENTS_inviteDelete', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            code: { type: DataTypes.TEXT, allowNull: false },
            channelid: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
            executorId: { type: DataTypes.INTEGER, allowNull: true },
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
        }, { tableName: 'EVENTS_messageReactionAdd', timestamps: false });
    
        // EVENTS_messageReactionRemove Table
        this.EVENTS_messageReactionRemove = this.sequelize.define('EVENTS_messageReactionRemove', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            reactionId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
            messageId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
            userId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
            datetime: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
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
        }, { tableName: 'EVENTS_voiceStateUpdate', timestamps: false });
    
        // STATE_voiceLeft Table
        this.STATE_voiceLeft = this.sequelize.define('STATE_voiceLeft', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            channelid: { type: DataTypes.BIGINT, allowNull: true },
            userid: { type: DataTypes.BIGINT, allowNull: true },
            date: { type: DataTypes.BIGINT, allowNull: true },
        }, { tableName: 'STATE_voiceLeft', timestamps: false });
    
        // STATS_voiceJoin Table
        this.STATS_voiceJoin = this.sequelize.define('STATS_voiceJoin', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            userid: { type: DataTypes.BIGINT, allowNull: true },
            channelid: { type: DataTypes.BIGINT, allowNull: true },
            date: { type: DataTypes.BIGINT, allowNull: true },
        }, { tableName: 'STATS_voiceJoin', timestamps: false });
    
        // STATS_voiceSessions Table
        this.STATS_voiceSessions = this.sequelize.define('STATS_voiceSessions', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            type: { type: DataTypes.INTEGER, allowNull: true },
            start: { type: DataTypes.BIGINT, allowNull: true },
            end: { type: DataTypes.BIGINT, allowNull: true },
            userid: { type: DataTypes.BIGINT, allowNull: true },
        }, { tableName: 'STATS_voiceSessions', timestamps: false });
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
    .command('add', 'Add a new channel', {
        text: { type: 'boolean', description: 'Add a text channel' },
        voice: { type: 'boolean', description: 'Add a voice channel' },
        forum: { type: 'boolean', description: 'Add a forum channel' },
        name: { alias: 'n', type: 'string', demandOption: true, description: 'Channel name' },
        id: { alias: 'i', type: 'string', demandOption: true, description: 'Channel ID' },
    })
    .command('remove', 'Remove a channel', {
        text: { type: 'boolean', description: 'Remove a text channel' },
        voice: { type: 'boolean', description: 'Remove a voice channel' },
        forum: { type: 'boolean', description: 'Remove a forum channel' },
        id: { alias: 'i', type: 'string', demandOption: true, description: 'Channel ID' },
    })
    .command('create', 'Create a new trigger function', {
        triggers: { alias: 't', type: 'string', demandOption: true, description: 'Trigger function definition' },
    })
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
        add --text|--voice|--forum --name "channelName" --id "channelID" 
            - Add a new channel of the specified type with the given name and ID.\n
        
        remove --text|--voice|--forum --id "channelID"
            - Remove a channel of the specified type with the given ID.

        create --triggers "functionName(message)"
            - Create a new trigger function based on the provided definition.

        init --token "discordToken" --id "clientId" --guid "guildId" --rsrole "roleId"
            - Initialize the bot configuration with the provided parameters.

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




const sanitizeName = (name) => name.replace(/[^\w]/g, '');

/**
 * Updates a variable in a .env file. If the variable does not exist, adds it.
 * @param {string} key - The key to update in the .env file
 * @param {string} value - The value to set the key to
 * @param {string} configPath - The path to the .env file to update
 */
function updateEnvVariable(key, value, configPath) {
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
 * Creates a new trigger function based on the provided definition.
 * @param {string} triggerDefinition - The definition of the trigger function in the format "functionName(message)"
 * @returns {void}
 */
function createTrigger(triggerDefinition) {
    const match = triggerDefinition.match(/^(\w+)\(message\)$/);
    if (!match) {
        console.error('Invalid trigger function format. Expected format: functionName(message)');
        return;
    }

    const functionName = match[1];
    const triggersDir = path.join(__dirname, '../src/common/Triggers');
    const triggerFilePath = path.join(triggersDir, `${functionName}.js`);
    const typesFilePath = path.join(__dirname, '../types/global.t.ts');
    const messagesFilePath = path.join(__dirname, '../internal/events.js');

    console.log(`Creating trigger '${functionName}'...`);

    if (!fs.existsSync(triggersDir)) {
        fs.mkdirSync(triggersDir, { recursive: true });
    }

    const triggerFileContent = `
    global.triggers = global.triggers || {};
    
    global.triggers.${functionName} = async function ${functionName}(message) {
        // Your trigger logic here
    };
    
    module.exports = {};
    `;

    fs.writeFileSync(triggerFilePath, triggerFileContent, 'utf8');
    console.log(`Trigger file '${triggerFilePath}' created.`);

    let typesContent = fs.readFileSync(typesFilePath, 'utf8');
    const typeMarker04 = '//CLIMarker#04';
    const typeMarker05 = '//CLIMarker#05';

    if (typesContent.includes(`${functionName}: (message: any) => Promise<void>;`)) {
        console.log(`Trigger type '${functionName}' already exists in global.t.ts.`);
    } else {
        typesContent = typesContent.replace(
            typeMarker04,
            `${typeMarker04}\n    ${functionName}: (message: any) => Promise<void>;`
        );
        typesContent = typesContent.replace(
            typeMarker05,
            `${typeMarker05}\n    ${functionName}: (message: any) => Promise<void>;`
        );
        fs.writeFileSync(typesFilePath, typesContent, 'utf8');
        console.log(`Trigger type '${functionName}' added to global.t.ts.`);
    }

    let messagesContent = fs.readFileSync(messagesFilePath, 'utf8');
    const messageMarker = '//CLIMarker#06';

    if (!messagesContent.includes(`await global.triggers.${functionName}(message);`)) {
        messagesContent = messagesContent.replace(
            messageMarker,
            `${messageMarker}\n    await global.triggers.${functionName}(message);`
        );
        fs.writeFileSync(messagesFilePath, messagesContent, 'utf8');
        console.log(`Trigger call '${functionName}' added to Events.`);
    } else {
        console.log(`Trigger call '${functionName}' already exists in Events`);
    }
}

/**
 * Adds a new channel to the config and Statics.js
 * @param {string} type - The type of channel to add (e.g. "text", "voice", "forum")
 * @param {string} channelName - The name of the channel to add
 * @param {string} channelId - The ID of the channel to add
 */
function addChannel(type, channelName, channelId) {
    const sanitizedChannelName = sanitizeName(channelName);

    console.log(`Adding channel '${sanitizedChannelName}' with ID '${channelId}' as ${type}...`);
    const staticsPath = path.join(__dirname, '../src/common/Statics.js');
    let staticsContent = fs.readFileSync(staticsPath, 'utf8');
    let typedefRegex = new RegExp(`(\\* @typedef {)([^}]*)} (${type})`, 's');
    if (typedefRegex.test(staticsContent)) {
        let exists = false;
        staticsContent = staticsContent.replace(
            typedefRegex,
            (match, p1, p2, p3) => {
                if (p2.includes(sanitizedChannelName)) {
                    exists = true;
                    return match;
                }
                if (p2 === '') {
                    return `${p1}'${sanitizedChannelName}'} ${p3}`;
                }
                return `${p1}${p2} | '${sanitizedChannelName}'} ${p3}`;
            }
        );
        if (exists) {
            console.log(`Channel '${sanitizedChannelName}' already exists in ${staticsPath}.`);
        } else {
            fs.writeFileSync(staticsPath, staticsContent, 'utf8');
            console.log(`Channel '${sanitizedChannelName}' added to ${staticsPath}.`);
        }
    } else {
        console.error(`Failed to find typedef for ${type} in Statics.js.`);
    }

    const channelsPath = path.join(__dirname, '../channels.json');
    const channels = JSON.parse(fs.readFileSync(channelsPath, 'utf8'));
    if (channels[type][sanitizedChannelName]) {
        console.log(`Channel '${sanitizedChannelName}' already exists in ${channelsPath}.`);
        return;
    }
    channels[type][sanitizedChannelName] = channelId;
    fs.writeFileSync(channelsPath, JSON.stringify(channels, null, 4), 'utf-8');
    console.log(`Channel '${sanitizedChannelName}' added to ${channelsPath}.`);
}

/**
 * Removes a string from a union type definition in a string.
 * @param {string} str The string containing the union type definition.
 * @param {string} valueToRemove The value to remove from the union type definition.
 * @returns {string} The string with the value removed from the union type definition.
 */
function removeStringFromUnion(str, valueToRemove) {
    const regex = new RegExp(`'${valueToRemove}'(\\s*\\|\\s*)?`, 'g');
    return str.replace(regex, '').replace(/\s*\|\s*$/, '');
}

/**
 * Finds the key associated with the given value in the given dictionary.
 * @param {Object<string,*>} dictionary The dictionary to search.
 * @param {*} value The value to search for.
 * @returns {string|null} The key associated with the given value or null if no key is found.
 */
function findKeyByValue(dictionary, value) {
    for (const [key, val] of Object.entries(dictionary)) {
        if (val === value) {
            return key;
        }
    }
    return null;
}

/**
 * Removes a channel from the config and Statics.js
 * @param {string} type - The type of channel to remove (e.g. "text", "voice", "forum")
 * @param {string} channelId - The ID of the channel to remove
 * @returns {boolean} Whether or not the channel was successfully removed
 */
function removeChannel(type, channelId) {
    console.log(`Removing channel with ID '${channelId}' as ${type}...`);

    const channelsPath = path.join(__dirname, '../channels.json');
    const channels = JSON.parse(fs.readFileSync(channelsPath, 'utf8'));
    const sanitizedChannelName = findKeyByValue(channels[type], channelId);
    if (!sanitizedChannelName) {
        console.log(`Channel with ID '${channelId}' already didn't exists in ${channelsPath}.`);
        return false;
    }
    delete channels[type][sanitizedChannelName];
    fs.writeFileSync(channelsPath, JSON.stringify(channels, null, 4), 'utf-8');
    console.log(`Channel '${sanitizedChannelName}' removed from ${channelsPath}.`);

    const staticsPath = path.join(__dirname, '../src/common/Statics.js');
    let staticsContent = fs.readFileSync(staticsPath, 'utf8');
    let typedefRegex = new RegExp(`(\\* @typedef {)([^}]*)} (${type})`, 's');
    if (typedefRegex.test(staticsContent)) {
        let exists = false;
        staticsContent = staticsContent.replace(
            typedefRegex,
            (match, p1, p2, p3) => {
                if (!p2.includes(sanitizedChannelName)) {
                    return match;
                }
                exists = true;
                return `${p1}${removeStringFromUnion(p2, sanitizedChannelName)}} ${p3}`;
            }
        );
        if (!exists) {
            console.log(`Channel '${sanitizedChannelName}' already didn't exist in ${staticsPath}.`);
        } else {
            fs.writeFileSync(staticsPath, staticsContent, 'utf8');
            console.log(`Channel '${sanitizedChannelName}' removed from ${staticsPath}.`);
        }
    } else {
        console.error(`Failed to find typedef for ${type} in Statics.js.`);
    }

    return true;
}


/**
 * Initializes the bot configuration by writing the given values to the
 * "config.env" file.
 *
 * @param {string} token - The bot token.
 * @param {string} clientId - The bot client ID.
 * @param {string} guid - The guild ID to join.
 * @param {string} restrictRole - The ID of the role to restrict to.
 * @returns {void}
 */
function initBotConfig(token, clientId, guid, restrictRole) {
    const configPath = path.join(__dirname, '../config.env');

    console.log('Initializing bot configuration...');

    updateEnvVariable('discord_cqd_token', token, configPath);
    updateEnvVariable('discord_cqd_cid', clientId, configPath);
    updateEnvVariable('discord_guid', guid, configPath);
    updateEnvVariable('restrictRole', restrictRole, configPath);

    console.log('Bot configuration initialized successfully.');
}
/**
 * Adds a channel to the "channels.json" file as a member count channel.
 *
 * The channel name must contain '{count}' where the member count should be displayed.
 * The channel ID should be the Discord ID of the channel.
 *
 * @param {string} channelName - The name of the channel to add.
 * @param {string} channelId - The Discord ID of the channel to add.
 * @returns {void}
 */
function addMemberCountChannel(channelName, channelId) {

    if (!channelName.includes('{count}')) {
        console.error(`Channel name must contain '{count}' where the member count should be displayed.`);
        return;
    }

    console.log(`Setting up '${channelName}' as a member count channel with ID '${channelId}'...`);

    const channelsPath = path.join(__dirname, '../channels.json');
    const channels = JSON.parse(fs.readFileSync(channelsPath, 'utf8'));
    if (channels['voice'][channelName]) {
        console.log(`Channel '${channelName}' already exists in ${channelsPath}.`);
    } else {
        channels['voice'][channelName] = channelId;
        fs.writeFileSync(channelsPath, JSON.stringify(channels, null, 4), 'utf-8');
        console.log(`Channel '${channelName}' added to ${channelsPath}.`);
    }
    addChannel('text', 'membercount', channelId)

    const configPath = path.join(__dirname, '../config.env');
    updateEnvVariable('membercount', channelId, configPath);
    console.log(`Environment variable 'membercount' set to '${channelId}'.`);
}


/**
 * Creates all tables in the database if they don't already exist.
 *
 * This operation will delete all existing tables and data in the database.
 *
 * @returns {Promise<void>}
 */
function createTables() {
    const db = new Database();
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
    const configPath = path.join(__dirname, '../config.env');

    console.log('Configuring database connection variables...');

    updateEnvVariable('dbhost', args.host, configPath);
    updateEnvVariable('dbname', args.dbname, configPath);
    updateEnvVariable('dbport', args.dbport, configPath);
    updateEnvVariable('dbuser', args.dbuser, configPath);
    updateEnvVariable('dbpass', args.dbpass, configPath);

    console.log('Database connection parameters have been updated in config.env.');

    if (args.create) {
        createTables();
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


if (argv._[0] === 'add') {
    if (argv.text) addChannel('text', argv.name, argv.id);
    else if (argv.voice) addChannel('voice', argv.name, argv.id);
    else if (argv.forum) addChannel('forum', argv.name, argv.id);
    else console.log('Please specify a valid channel type: --text, --voice, or --forum.');
} else if (argv._[0] === 'remove') {
    if (removeChannel('text', argv.id)) return;
    if (removeChannel('voice', argv.id)) return;
    if (removeChannel('forum', argv.id)) return;
} else if (argv._[0] === 'create') {
    if (argv.triggers) createTrigger(argv.triggers);
    else console.log('Please provide a valid trigger function definition: --triggers "functionName(message)"');
} else if (argv._[0] === 'init') {
    if (argv.token && argv.id && argv.guid && argv.rsrole) {
        initBotConfig(argv.token, argv.id, argv.guid, argv.rsrole);
    } else {
        console.log('Please provide all required options: --token, --id, --guid, --rsrole');
    }
} else if (argv._[0] === 'invite') {
    generateInviteLink();
} else if (argv._[0] === 'add-member-count') {
    if (argv.name && argv.id) {
        addMemberCountChannel(argv.name, argv.id);
    } else {
        console.log('Please provide both --name and --id options.');
    }
} else if (argv._[0] === 'bdd') {
    handleBddCommand(argv);
} else if (argv._[0] === 'help') {
    console.log('Use `cn help` to see available commands.');
} else {
    console.log('Invalid command. Use `cn help` to see available commands.');
}