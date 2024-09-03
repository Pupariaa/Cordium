//@ts-check
'use strict';
const path = require('path');
require(path.resolve(__dirname, '../../logutils'))
const filePath = path.resolve(__dirname, 'channelUpdate.js'); 

global.client.on('channelUpdate', async (oldChannel, newChannel) => {
    const functionName = 'channelUpdate';
    try {
        console.info(`${filePath} - Line ${__line} (${functionName}): Channel updated from: ${oldChannel.name} (ID: ${oldChannel.id}) to: ${newChannel.name} (ID: ${newChannel.id}).`);

    } catch (error) {
        console.error(`${filePath} - Line ${__line} (${functionName}): Error handling channel update:`, error);
    }
});

module.exports = {};
