'use strict';

const path = require('path');

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

function getFormattedTime() {
    const date = Date.now();
    const options = { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Intl.DateTimeFormat('fr-FR', options).format(date);
}

console.logFormat = function (logContext) {
    const { typeColor, type, filename, line, callContext } = logContext;
    return `${typeColor}${getFormattedTime()} [${type}]${colors.Reset} ${filename} - Line ${line} (${colors['FgGreen']}${callContext}${colors['Reset']}):`;
};

function logFactory(logger, type, typeColor, defaultFormatArgs = (logContext, ...args) => args.join(' '), defaultShouldLog = (logContext, ...args) => true) {
    return function (filename, formatArgs = defaultFormatArgs, shouldLog = defaultShouldLog) {
        return function (line, callContext, ...args) {
            const logContext = { typeColor, type, filename, line, callContext };
            if (!shouldLog(logContext, ...args)) return;
            logger(console.logFormat(logContext), formatArgs(logContext, ...args));
        }
    };
}

function formatArgsForError(logContext, ...args) {
    if (!args.length) return '';
    const err = args.pop();
    if (!(err instanceof Error)) return `${args.join(' ')}${args.length > 0 ? ' ' : ''}${err}`;

    const defaultReturn = `${args.join(' ')}${args.length > 0 ? ' ' : ''}(${err.name}) ${err.message}`;
    const stack = err.stack;
    const stackLines = stack.split('\n');
    let errorLocation = stackLines.find(line => line.includes('.js:'));
    if (!errorLocation) return defaultReturn;
    errorLocation = errorLocation.trim();
    const spaceCount = errorLocation.split(' ').length - 1;

    if (spaceCount === 2) {
        const match = errorLocation.match(/at (.+) \(([^)]+):(\d+):(\d+)\)/);
        if (!match) return defaultReturn;
        const functionName = match[1];
        const fileName = path.relative(projectRoot, match[2]);
        const lineNumber = match[3];
        const rowNumber = match[4];
        return `${args.join(' ')}${args.length > 0 ? ' ' : ''}(${err.name}) ${err.message} (${fileName}:${functionName}:${lineNumber}:${rowNumber})`;
    } else {
        const match = errorLocation.match(/at ([^)]+):(\d+):(\d+)/);
        if (!match) return defaultReturn;
        const fileName = path.relative(projectRoot, match[1]);
        const lineNumber = match[2];
        const rowNumber = match[3];
        return `${args.join(' ')}${args.length > 0 ? ' ' : ''}(${err.name}) ${err.message} (${fileName}:${lineNumber}:${rowNumber})`;
    }
}

console.createReport = logFactory(console.info, 'INFO', colors.FgCyan);
console.createReportWarn = logFactory(console.warn, 'WARN', colors.FgYellow);
console.createReportError = logFactory(console.error, 'ERROR', colors.FgRed, formatArgsForError);
console.createReports = function (filename) {
    return {
        report: console.createReport(filename),
        reportWarn: console.createReportWarn(filename),
        reportError: console.createReportError(filename)
    };
};

global.colors = colors;

console.fitOnTerm = function (text, mustEndWith = '') {
    const lines = text.split('\n');
    const processedLines = lines.map(line => {
        let result = '';
        let curTrueLength = 0;
        let i = 0;
        const mustEndWithTrueLength = mustEndWith.trueLength();
        while (i < line.length && curTrueLength < process.stdout.columns - mustEndWithTrueLength - 3) {
            result += line[i];
            i++;
            curTrueLength = result.trueLength();
        }
        return i === line.length ? result : `${result}...${mustEndWith}`;
    });
    return processedLines.join('\n');
};

module.exports = {};