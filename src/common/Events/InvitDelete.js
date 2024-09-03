//@ts-check
'use strict';
const path = require('path');
require(path.resolve(__dirname, '../../logutils'));
const filePath = path.resolve(__dirname, 'inviteDelete.js');

global.client.on('inviteDelete', async (invite) => {
    const functionName = 'inviteDelete';
    try {
        console.info(`${filePath} - Line ${__line} (${functionName}): Invite deleted: ${invite.code}.`);

    } catch (error) {
        console.error(`${filePath} - Line ${__line} (${functionName}): Error handling invite deletion:`, error);
    }
});

module.exports = {};
