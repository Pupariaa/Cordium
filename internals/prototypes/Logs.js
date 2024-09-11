'use strict';

// const fs = require('fs');
// const path = require('path');

const originalLog = console.log;
const originalInfo = console.info;
const originalError = console.error;
const originalWarn = console.warn;

const colors = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",

    FgBlack: "\x1b[30m",
    FgRed: "\x1b[31m",
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",
    FgWhite: "\x1b[37m",

    BgBlack: "\x1b[40m",
    BgRed: "\x1b[41m",
    BgGreen: "\x1b[42m",
    BgYellow: "\x1b[43m",
    BgBlue: "\x1b[44m",
    BgMagenta: "\x1b[45m",
    BgCyan: "\x1b[46m",
    BgWhite: "\x1b[47m"
};

// function getFormattedDate() {
//     const date = new Date();
//     const options = { timeZone: 'Europe/Paris', day: '2-digit', month: '2-digit', year: 'numeric' };
//     return new Intl.DateTimeFormat('fr-FR', options).format(date).replace(/\//g, '-');
// }

function getFormattedTime() {
    const date = Date.now();
    const options = { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Intl.DateTimeFormat('fr-FR', options).format(date);
}

console.log = function (...args) {
    originalLog(colors.FgBlue, `${getFormattedTime()} [LOG]`, colors.Reset, ...args);
};

console.info = function (...args) {
    originalInfo(colors.FgCyan, `${getFormattedTime()} [INFO]`, colors.Reset, ...args);
};

console.error = function (...args) {
    originalError(colors.FgRed, `${getFormattedTime()} [ERROR]`, colors.Reset, ...args);
};

console.warn = function (...args) {
    originalWarn(colors.FgYellow, `${getFormattedTime()} [WARN]`, colors.Reset, ...args);
};

console.success = function (...args) {
    originalLog(colors.FgGreen, `${getFormattedTime()} [GOOD]`, colors.Reset, ...args);
};

console.createReportFunction = function (filename, formatArgs = (...args) => args.join(' '), shouldLog = (functionName, ...args) => true) {
    return function (line, functionName, ...args) {
        if (!shouldLog(filename, ...args)) return;
        console.info(`${filename} - Line ${line} (${colors['FgGreen']}${functionName}${colors['Reset']}): `, formatArgs(...args));
    }
};

console.createReportErrorFunction = function (filename) {
    return function (line, functionName, err) {
        console.error(`${filename} - Line ${line} (${colors['FgGreen']}${functionName}${colors['Reset']}): `, err);
    }
};

global.colors = colors;

module.exports = {};