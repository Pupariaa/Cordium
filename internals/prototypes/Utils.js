'use strict';
const { __cfn, __cf } = eval(require(`current_filename`));
const { report, reportWarn, reportError } = console.createReports(__cfn);

const { exec } = require('child_process');
const path = require('path');

function downloadFile(url, filePath) {
    const functionName = 'downloadFile';
    const command = `curl "${url}" --output "${filePath}" > /dev/null 2>&1`;

    return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            if (err) {
                reportError(__line, functionName, `Error during download of ${global.colors.FgYellow}${url}${global.colors.Reset}:`, err);
                reject(err);
            } else {
                resolve(filePath);
            }
        });
    });
}

function parseErr(err) {
    const stack = err.stack;
    const stackLines = stack.split('\n');
    let errorLocation = stackLines.find(line => line.includes('.js:'));
    if (!errorLocation) return null;
    errorLocation = errorLocation.trim();
    const spaceCount = errorLocation.split(' ').length - 1;
    let functionName, fileName, lineNumber, rowNumber;
    if (spaceCount === 2) {
        const match = errorLocation.match(/(?:at )?(.+) \(([^)]+):(\d+)(?::(\d+))?\)/);
        if (!match) return null;
        functionName = match[1];
        fileName = path.relative(global.projectRoot, match[2]);
        lineNumber = match[3];
        rowNumber = match[4];
    } else {
        const match = errorLocation.match(/(?:at )?([^)]+):(\d+)(?::(\d+))?/);
        if (!match) return null;
        fileName = path.relative(global.projectRoot, match[1]);
        lineNumber = match[2];
        rowNumber = match[3];
    }
    return [ functionName, fileName, lineNumber, rowNumber ];
}

function formatErr(err) {
    let r = `(${err.name}) ${err.message}`;
    const parsedErr = parseErr(err);
    return !parsedErr || parsedErr.every(e => !e) ? r : `${r} (${parsedErr.filter(e => e).join(':')})`;
}

function getOrNull(obj, path) {
    return path.split('.').reduce((acc, key) => acc?.[key] ?? null, obj);
}

module.exports = {
    downloadFile,
    parseErr,
    formatErr,
    getOrNull,
};