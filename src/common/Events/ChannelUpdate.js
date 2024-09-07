//@ts-check
'use strict';
require('puparia.getlines.js');

global.client.on('channelUpdate', async (oldChannel, newChannel) => {
    if (newChannel.guild.id !== global.guild.id) return;
    try {
        console.info(`${__filename} - Line ${__line} (channelUpdate): Channel updated from: ${oldChannel.name} (ID: ${oldChannel.id}) to: ${newChannel.name} (ID: ${newChannel.id}).`);
    } catch (error) {
        console.error(`${__filename} - Line ${__line} (channelUpdate): Error handling channel update:`, error);
    }
});

module.exports = {};
