'use strict';
const { Events } = require('discord.js');

Events.createReportEvent = function(filename) {
    return function(line, eventName, ...args) {
        let report = `${filename} - Line ${line} (${global.colors['FgGreen']}${eventName}${global.colors['Reset']}):`;
        let i = 0;
        while (i < args.length) {
            report += ` ${global.colors['FgCyan']}${args[i]}${global.colors['Reset']}="${global.colors['FgYellow']}${args[i+1]}${global.colors['Reset']}"`;
            if (i + 2 < args.length && args[i+2] === '->') {
                report += `->"${global.colors['FgYellow']}${args[i+3]}${global.colors['Reset']}"`;
                i += 2;
            }
            i += 2;
        }
        console.info(report);       
    }
};