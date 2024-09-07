//@ts-check
'use strict';
require('puparia.getlines.js');

global.client.on('channelCreate', async (channel) => {
    if (channel.guild.id !== global.guild.id) return;
    try {
        console.info(`${__filename} - Line ${__line} (channelCreate): Channel created: ${channel.name} (ID: ${channel.id}).`);
    } catch (error) {
        console.error(`${__filename} - Line ${__line} (channelCreate): Error handling channel creation:`, error);
    }
});

module.exports = {};
