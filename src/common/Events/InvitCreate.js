//@ts-check
'use strict';
const path = require('path');
require('puparia.getlines.js')
const filePath = path.resolve(__dirname, 'inviteCreate.js'); 

global.client.on('inviteCreate', async (invite) => {
    try {
        console.info(`${filePath} - Line ${__line} (inviteCreate): Invite created: ${invite.url} (Code: ${invite.code}).`);
       
    } catch (error) {
        console.error(`${filePath} - Line ${__line} (inviteCreate): Error handling invite creation:`, error);
    }
});

module.exports = {};
