'use strict';

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

function logFactory(logger, type, typeColor) {
    return function (filename, formatArgs = (...args1) => args1.join(' '), shouldLog = (context, ...args2) => true) {
        return function (line, context, ...args) {
            if (!shouldLog(context, ...args)) return;
            logger(typeColor, `${getFormattedTime()} [${type}]${colors.Reset}`, `${filename} - Line ${line} (${colors['FgGreen']}${context}${colors['Reset']}):`, formatArgs(...args));
        }
    };
}

console.createReport = logFactory(console.info, 'INFO', colors.FgCyan);
console.createReportWarn = logFactory(console.warn, 'WARN', colors.FgYellow);
console.createReportError = logFactory(console.error, 'ERROR', colors.FgRed);
console.createReports = function (filename) {
    return {
        report: console.createReport(filename),
        reportWarn: console.createReportWarn(filename),
        reportError: console.createReportError(filename)
    };
}

global.colors = colors;

module.exports = {};