//@ts-check
'use strict';
const path = require('path');
require('puparia.getlines.js')
const filePath = path.resolve(__dirname, 'messageDelete.js'); 

global.client.on('messageDelete', async (message) => {
    try {
        if (message.partial) {
            console.warn(`${filePath} - Line ${__line} (messageDelete): Deleted message is partial, cannot fetch details.`);
            return;
        }

    } catch (error) {
        console.error(`${filePath} - Line ${__line} (messageDelete): Error handling message delete event:`, error);
    }
});

module.exports = {};
