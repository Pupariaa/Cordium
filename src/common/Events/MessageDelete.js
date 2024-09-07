//@ts-check
'use strict';
require('puparia.getlines.js');

global.client.on('messageDelete', async (message) => {
    if (message.guild.id !== global.guild.id) return;
    try {
        if (message.partial) {
            console.warn(`${__filename} - Line ${__line} (messageDelete): Deleted message is partial, cannot fetch details.`);
            return;
        }
    } catch (error) {
        console.error(`${__filename} - Line ${__line} (messageDelete): Error handling message delete event:`, error);
    }
});

module.exports = {};
