//@ts-check
'use strict';
const path = require('path');
require('puparia.getlines.js')
const filePath = path.resolve(__dirname, 'inviteDelete.js');

global.client.on('inviteDelete', async (invite) => {
    try {
        console.info(`${filePath} - Line ${__line} (inviteDelete): Invite deleted: ${invite.code}.`);

    } catch (error) {
        console.error(`${filePath} - Line ${__line} (inviteDelete): Error handling invite deletion:`, error);
    }
});

module.exports = {};
