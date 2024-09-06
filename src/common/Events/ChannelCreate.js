//@ts-check
'use strict';
const path = require('path');
const filePath = path.resolve(__dirname, 'channelCreate.js');
require('puparia.getlines.js')

global.client.on('channelCreate', async (channel) => {
    try {
        console.info(`${filePath} - Line ${__line} (channelCreate): Channel created: ${channel.name} (ID: ${channel.id}).`);

    } catch (error) {
        console.error(`${filePath} - Line ${__line} (channelCreate): Error handling channel creation:`, error);
    }
});

module.exports = {};
