//@ts-check
'use strict';
require('puparia.getlines.js');

global.client.on('guildBanAdd', async (ban) => {
    if (ban.guild.id !== global.guild.id) return;
    try {
        console.info(`${__filename} - Line ${__line} (guildBanAdd): Member banned: ${ban.user.tag} (ID: ${ban.user.id}).`);
    } catch (error) {
        console.error(`${__filename} - Line ${__line} (guildBanAdd): Error handling member ban:`, error);
    }
});

module.exports = {};
