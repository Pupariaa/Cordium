//@ts-check
'use strict';
const path = require('path');
require(path.resolve(__dirname, '../../logutils'));
const filePath = path.resolve(__dirname, 'guildBanAdd.js')

global.client.on('guildBanAdd', async (ban) => {
    const functionName = 'guildBanAdd';
    try {
        console.info(`${filePath} - Line ${__line} (${functionName}): Member banned: ${ban.user.tag} (ID: ${ban.user.id}).`);

    } catch (error) {
        console.error(`${filePath} - Line ${__line} (${functionName}): Error handling member ban:`, error);
    }
});

module.exports = {};
