//@ts-check
'use strict';
require('puparia.getlines.js');

global.client.on('channelDelete', async (channel) => {
    if (channel.guild.id !== global.guild.id) return;
    try {
        console.info(`${__filename} - Line ${__line} (channelDelete): Channel deleted: ${channel.name} (ID: ${channel.id}).`);
    } catch (error) {
        console.error(`${__filename} - Line ${__line} (channelDelete): Error handling channel deletion:`, error);
    }
});

module.exports = {};
