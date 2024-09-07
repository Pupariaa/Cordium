//@ts-check
'use strict';
require('puparia.getlines.js');

global.client.on('inviteCreate', async (invite) => {
    if (invite.guild.id !== global.guild.id) return;
    try {
        console.info(`${__filename} - Line ${__line} (inviteCreate): Invite created: ${invite.url} (Code: ${invite.code}).`);
    } catch (error) {
        console.error(`${__filename} - Line ${__line} (inviteCreate): Error handling invite creation:`, error);
    }
});

module.exports = {};
