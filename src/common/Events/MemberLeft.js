//@ts-check
'use strict';
require('puparia.getlines.js');

global.client.on('guildMemberRemove', async member => {
    if (member.guild.id !== global.guild.id) return;
    try {
        console.info(`${__filename} - Line ${__line} (guildMemberRemove): Member left: ${member.user.tag} (ID: ${member.user.id}).`);
    } catch (e) {
        console.error(`${__filename} - Line ${__line} (guildMemberRemove): Error in guildMemberRemove event handler:`, e);
    }
});

module.exports = {};
