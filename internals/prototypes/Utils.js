'use strict';
const { __cfn, __cf } = eval(require(`current_filename`));
const { report, reportWarn, reportError } = console.createReports(__cfn);

const { exec } = require('child_process');

module.exports = {
    downloadFile: function (url, filePath) {
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
    },
};