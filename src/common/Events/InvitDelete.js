//@ts-check
'use strict';
require('puparia.getlines.js');

global.client.on('inviteDelete', async (invite) => {
    if (invite.guild.id !== global.guild.id) return;
    try {
        console.info(`${__filename} - Line ${__line} (inviteDelete): Invite deleted: ${invite.code}.`);
    } catch (error) {
        console.error(`${__filename} - Line ${__line} (inviteDelete): Error handling invite deletion:`, error);
    }
});

module.exports = {};
