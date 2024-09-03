//@ts-check
'use strict';
const filePath = 'src/common/Events/channelCreate.js';
const path = require('path');
require(path.resolve(__dirname, '../../logutils'));

global.client.on('channelCreate', async (channel) => {
    const functionName = 'channelCreate';
    try {
        console.info(`${filePath} - Line ${__line} (${functionName}): Channel created: ${channel.name} (ID: ${channel.id}).`);

    } catch (error) {
        console.error(`${filePath} - Line ${__line} (${functionName}): Error handling channel creation:`, error);
    }
});

module.exports = {};
