//@ts-check
'use strict';
const path = require('path');
require(path.resolve(__dirname, '../../logutils')); 
const filePath = path.resolve(__dirname, 'inviteCreate.js'); 

global.client.on('inviteCreate', async (invite) => {
    const functionName = 'inviteCreate';
    try {
        console.info(`${filePath} - Line ${__line} (${functionName}): Invite created: ${invite.url} (Code: ${invite.code}).`);
       
    } catch (error) {
        console.error(`${filePath} - Line ${__line} (${functionName}): Error handling invite creation:`, error);
    }
});

module.exports = {};
