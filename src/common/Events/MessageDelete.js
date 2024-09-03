//@ts-check
'use strict';
const path = require('path');
require(path.resolve(__dirname, '../../logutils'));
const filePath = path.resolve(__dirname, 'messageDelete.js'); 

global.client.on('messageDelete', async (message) => {
    const functionName = 'messageDelete';
    try {
        if (message.partial) {
            console.warn(`${filePath} - Line ${__line} (${functionName}): Deleted message is partial, cannot fetch details.`);
            return;
        }

    } catch (error) {
        console.error(`${filePath} - Line ${__line} (${functionName}): Error handling message delete event:`, error);
    }
});

module.exports = {};
