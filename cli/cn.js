#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
require('dotenv').config({ path: path.join(__dirname, '../config.env') });

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
    .help()
    .argv;

// Function to sanitize channel name
const sanitizeName = (name) => name.replace(/[^\w]/g, '');

function updateEnvVariable(key, value, configPath) {
    let configContent = fs.readFileSync(configPath, 'utf8');
    const regex = new RegExp(`^${key}=.*$`, 'm');

    if (configContent.match(regex)) {
        // If the key exists, replace its value
        configContent = configContent.replace(regex, `${key}=${value}`);
        console.log(`Updated '${key}' in config.env.`);
    } else {
        // If the key does not exist, append it
        configContent += `\n${key}="${value}"`;
        console.log(`Added '${key}' to config.env.`);
    }

    fs.writeFileSync(configPath, configContent, 'utf8');
}
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
    const messagesFilePath = path.join(__dirname, '../src/common/Events/Messages.js');

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

    // Step 3: Update src/common/Events/Messages.js
    let messagesContent = fs.readFileSync(messagesFilePath, 'utf8');
    const messageMarker = '//CLIMarker#06';

    if (!messagesContent.includes(`await global.triggers.${functionName}(message);`)) {
        messagesContent = messagesContent.replace(
            messageMarker,
            `${messageMarker}\n    await global.triggers.${functionName}(message);`
        );
        fs.writeFileSync(messagesFilePath, messagesContent, 'utf8');
        console.log(`Trigger call '${functionName}' added to Messages.js.`);
    } else {
        console.log(`Trigger call '${functionName}' already exists in Messages.js.`);
    }
}

// Function to add a channel to the config and Statics.js
function addChannel(type, channelName, channelId) {
    const sanitizedChannelName = sanitizeName(channelName);

    console.log(`Adding channel '${sanitizedChannelName}' with ID '${channelId}' as ${type}...`);

    // Update Statics.js
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

    // Update channels.json
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

function removeStringFromUnion(str, valueToRemove) {
    const regex = new RegExp(`'${valueToRemove}'(\\s*\\|\\s*)?`, 'g');
    return str.replace(regex, '').replace(/\s*\|\s*$/, '');
}

function findKeyByValue(dictionary, value) {
    for (const [key, val] of Object.entries(dictionary)) {
        if (val === value) {
            return key;
        }
    }
    return null;
}

// Function to remove a channel from the config and Statics.js
function removeChannel(type, channelId) {
    console.log(`Removing channel with ID '${channelId}' as ${type}...`);

    // Update channels.json
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

    // Update Statics.js
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
function generateInviteLink() {
    const clientId = process.env.discord_cqd_cid;

    if (!clientId) {
        console.error('Client ID is missing in environment variables. Please initialize the bot configuration using `cn init`.');
        return;
    }

    const inviteLink = `https://discord.com/oauth2/authorize?client_id=${clientId}&scope=bot&permissions=1099511627775`;
    console.log(`Invite your bot to a server using the following link:\n${inviteLink}`);
}


function initBotConfig(token, clientId, guid, restrictRole) {
    const configPath = path.join(__dirname, '../config.env');

    console.log('Initializing bot configuration...');

    updateEnvVariable('discord_cqd_token', token, configPath);
    updateEnvVariable('discord_cqd_cid', clientId, configPath);
    updateEnvVariable('discord_guid', guid, configPath);
    updateEnvVariable('restrictRole', restrictRole, configPath);

    console.log('Bot configuration initialized successfully.');
}
function addMemberCountChannel(channelName, channelId) {

    if (!channelName.includes('{count}')) {
        console.error(`Channel name must contain '{count}' where the member count should be displayed.`);
        return;
    }

    console.log(`Setting up '${channelName}' as a member count channel with ID '${channelId}'...`);

    // Update channels.json
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
    // Set the environment variable for member count channel ID
    const configPath = path.join(__dirname, '../config.env');
    updateEnvVariable('membercount', channelId, configPath);
    console.log(`Environment variable 'membercount' set to '${channelId}'.`);
}


// Handling commands
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
} else {
    console.log('Invalid command. Use `cn add`, `cn remove`, `cn create`, `cn init`, `cn invite`, or `cn add-member-count` with the appropriate options.');
}
