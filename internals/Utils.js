'use strict';
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { Events } = require('discord.js');

function downloadFile(url, filePath) {
    const command = `curl "${url}" --output "${filePath}" > NUL 2>&1`;

    return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                resolve(filePath);
            }
        });
    });
}

function getOrNull(obj, ...args) {
    return (args.length === 1 && typeof args[0] === 'string' ? args[0].split('.') : args).reduce((acc, key) => acc?.[key] ?? null, obj);
}

function validPort(port) {
    return Number.isInteger(port) && port >= 1 && port <= 65535;
}

function validChannelId(channelId) {
    const regex = /^[0-9]{17,19}$/;
    return regex.test(channelId);
}

function capitalize(word) {
    return word[0].toUpperCase() + word.slice(1);
}

function decapitalize(word) {
    return word[0].toLowerCase() + word.slice(1);
}

function toCamelCase(varname) {
    return decapitalize(varname).replace(/_(.)/g, (_, chr) => chr.toUpperCase());
}

function loadEnvPath(key, defaultValue) {
    const envValue = process.env[key];
    return path.join(global.projectRoot, envValue ? (fs.existsSync(envValue) ? envValue : defaultValue) : defaultValue);
}

function compareObjects(obj1, obj2, path = '', seen = new WeakMap()) {
    // Check for circular references
    if (typeof obj1 === 'object' && obj1 !== null) {
        if (seen.has(obj1)) return seen.get(obj1) === obj2 ? [] : [path];
        seen.set(obj1, obj2);
    }

    if (typeof obj1 !== typeof obj2) return [path];
    if (typeof obj1 !== 'object' || obj1 === null || obj2 === null) {
        return obj1 !== obj2 ? [path] : [];
    }
    if (Array.isArray(obj1) !== Array.isArray(obj2)) return [path];

    let differences = [];

    if (Array.isArray(obj1)) {
        if (obj1.length !== obj2.length) return [path];
        for (let i = 0; i < obj1.length; i++) {
            differences.push(...compareObjects(obj1[i], obj2[i], `${path}[${i}]`, seen));
        }
    } else {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) return [path];

        for (let key of keys1) {
            if (!obj2.hasOwnProperty(key)) {
                differences.push(path ? `${path}.${key}` : key);
            } else {
                differences.push(...compareObjects(obj1[key], obj2[key], path ? `${path}.${key}` : key, seen));
            }
        }
    }

    return differences;
}

// Because apparently javascript doesn't have a built-in way to do this
async function walkDir(dirPath, callback) {
    const files = await fs.readdirSync(dirPath);
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.statSync(filePath);
        if (stats.isDirectory()) {
            await walkDir(filePath, callback);
        } else {
            callback(filePath, stats);
        }
    }
}

function loadConfig() {
    // Defaults for unspecified env variables
    const defaultEndpointsFolder = './src/api/endpoints';
    const defaultCommandsFolder = './src/commands';
    const defaultEventsFolder = './src/events';
    const defaultFilesFolder = './src/files';
    const defaultSandboxFolder = './src/sandbox';
    const defaultPort = 3000;

    require('dotenv').config({ path: path.join(global.projectRoot, 'config', 'config.env') });

    const missingVars = [];
    for (const requiredVar of ['client_token', 'client_id', 'discord_guild_id']) {
        if (!process.env[requiredVar]) missingVars.push(requiredVar);
        if (missingVars.length > 0) break;
        Object.defineProperty(global, toCamelCase(requiredVar), {
            value: process.env[requiredVar],
            configurable: false,
            enumerable: true,
            writable: true,
        });
    }
    if (missingVars.length > 0) {
        console.reportError('Missing required environment variables:', ...missingVars);
        process.exit(1);
    }
    global.listenEvents = process.env.listen_events ? process.env.listen_events.toLowerCase() === 'true' : true;
    global.reportEvents = process.env.report_events ? process.env.report_events.toLowerCase() === 'true' : true;

    global.endpointsFolder = loadEnvPath('endpoints_folder', defaultEndpointsFolder);
    global.commandsFolder = loadEnvPath('commands_folder', defaultCommandsFolder);
    global.eventsFolder = loadEnvPath('events_folder', defaultEventsFolder);
    global.filesFolder = loadEnvPath('files_folder', defaultFilesFolder);
    global.sandboxFolder = loadEnvPath('sandbox_folder', defaultSandboxFolder);

    global.apiEnable = process.env.api_enable ? process.env.api_enable.toLowerCase() === 'true' : false;
    global.apiPort = process.env.api_port ? validPort(process.env.api_port) ? process.env.api_port : defaultPort : defaultPort;
    global.utcDiff = parseInt((process.env.utc_diff ? process.env.utc_diff : 0) * 60 * 60 * 1000);

    global.configChannels = JSON.parse(fs.readFileSync(path.join(global.projectRoot, 'config', 'channels.json'), 'utf-8'));
    if (Object.values(global.configChannels).every((channels) => Object.keys(channels).length === 0)) {
        console.reportWarn('No channels in config/channels.json.');
    }
    for (const basename of ['reportEvents', 'listenEvents']) {
        const filename = `${basename}.json`;
        const jsonPath = path.join(global.projectRoot, 'config', filename);
        const json = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        Object.defineProperty(global, `config${capitalize(basename)}`, {
            value: json,
            configurable: false,
            enumerable: true,
            writable: true,
        });
        for (const eventName of Object.keys(Events)) {
            if (!Object.keys(json).includes(eventName) && eventName !== Events.ClientReady) {
                console.reportWarn(`Missing ${eventName} in ${filename}`);
            }
        }
    }
}

module.exports = {
    downloadFile,
    getOrNull,
    validPort,
    capitalize,
    decapitalize,
    toCamelCase,
    validChannelId,
    loadEnvPath,
    compareObjects,
    walkDir,
    loadConfig,
};