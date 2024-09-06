//@ts-check
'use strict';
const path = require('path');
require('puparia.getlines.js')
const filePath = path.resolve(__dirname, 'guildBanAdd.js')

global.client.on('guildBanAdd', async (ban) => {
    try {
        console.info(`${filePath} - Line ${__line} (guildBanAdd): Member banned: ${ban.user.tag} (ID: ${ban.user.id}).`);

    } catch (error) {
        console.error(`${filePath} - Line ${__line} (guildBanAdd): Error handling member ban:`, error);
    }
});

module.exports = {};
