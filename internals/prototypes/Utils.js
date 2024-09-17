'use strict';
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function downloadFile(url, filePath) {
    const functionName = 'downloadFile';
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

function compareOldAndNew(oldObj, newObj) {
    const reportEventArgs = [];
    compareObjects(oldObj, newObj).forEach(diff => {
        const oldValue = getOrNull(oldObj, diff); if (typeof oldValue !== 'string') return;
        const newValue = getOrNull(newObj, diff); if (typeof newValue !== 'string') return;
        reportEventArgs.push(diff, getOrNull(oldObj, diff), '->', getOrNull(newObj, diff));
    });
    return reportEventArgs;
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
    compareOldAndNew
};