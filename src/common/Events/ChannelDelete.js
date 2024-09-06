//@ts-check
'use strict';
const path = require('path');
require('puparia.getlines.js')
const filePath = path.resolve(__dirname, 'channelDelete.js');

global.client.on('channelDelete', async (channel) => {
    try {
        console.info(`${filePath} - Line ${__line} (channelDelete): Channel deleted: ${channel.name} (ID: ${channel.id}).`);

    } catch (error) {
        console.error(`${filePath} - Line ${__line} (channelDelete): Error handling channel deletion:`, error);
    }
});

module.exports = {};
