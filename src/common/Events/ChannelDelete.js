//@ts-check
'use strict';
const path = require('path');
require(path.resolve(__dirname, '../../logutils')); 
const filePath = path.resolve(__dirname, 'channelDelete.js');

global.client.on('channelDelete', async (channel) => {
    const functionName = 'channelDelete';
    try {
        console.info(`${filePath} - Line ${__line} (${functionName}): Channel deleted: ${channel.name} (ID: ${channel.id}).`);

    } catch (error) {
        console.error(`${filePath} - Line ${__line} (${functionName}): Error handling channel deletion:`, error);
    }
});

module.exports = {};
