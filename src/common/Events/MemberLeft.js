//@ts-check
'use strict';
const path = require('path');
require('puparia.getlines.js')
const filePath = path.resolve(__dirname, 'guildMemberRemove.js'); 

global.client.on('guildMemberRemove', async member => {
    try {
        console.info(`${filePath} - Line ${__line} (guildMemberRemove): Member left: ${member.user.tag} (ID: ${member.user.id}).`);

    } catch (e) {
        console.error(`${filePath} - Line ${__line} (guildMemberRemove): Error in guildMemberRemove event handler:`, e);
    }
});

module.exports = {};
