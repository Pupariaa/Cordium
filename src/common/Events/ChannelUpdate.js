//@ts-check
'use strict';
const path = require('path');
require('puparia.getlines.js')
const filePath = path.resolve(__dirname, 'channelUpdate.js'); 

global.client.on('channelUpdate', async (oldChannel, newChannel) => {
    try {
        console.info(`${filePath} - Line ${__line} (channelUpdate): Channel updated from: ${oldChannel.name} (ID: ${oldChannel.id}) to: ${newChannel.name} (ID: ${newChannel.id}).`);

    } catch (error) {
        console.error(`${filePath} - Line ${__line} (channelUpdate): Error handling channel update:`, error);
    }
});

module.exports = {};
