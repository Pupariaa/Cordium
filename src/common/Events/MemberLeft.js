//@ts-check
'use strict';
const path = require('path');
require(path.resolve(__dirname, '../../logutils'));
const filePath = path.resolve(__dirname, 'guildMemberRemove.js'); 

global.client.on('guildMemberRemove', async member => {
    const functionName = 'guildMemberRemove';
    try {
        console.info(`${filePath} - Line ${__line} (${functionName}): Member left: ${member.user.tag} (ID: ${member.user.id}).`);

    } catch (e) {
        console.error(`${filePath} - Line ${__line} (${functionName}): Error in guildMemberRemove event handler:`, e);
    }
});

module.exports = {};
