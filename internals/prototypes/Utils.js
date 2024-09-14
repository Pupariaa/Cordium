'use strict';
const { exec } = require('child_process');

function downloadFile(url, filePath) {
    const functionName = 'downloadFile';
    const command = `curl "${url}" --output "${filePath}" > /dev/null 2>&1`;

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

module.exports = {
    downloadFile,
    getOrNull,
    validPort,
    capitalize,
    decapitalize,
    toCamelCase,
    validChannelId
};