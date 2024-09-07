//@ts-check
'use strict';
require('puparia.getlines.js');

global.client.on('roleCreate', async (role) => {
    if (role.guild.id !== global.guild.id) return;
    try {
        console.info(`${__filename} - Line ${__line} (roleCreate): Role created: ${role.name} (ID: ${role.id}).`);
    } catch (error) {
        console.error(`${__filename} - Line ${__line} (roleCreate): Error handling role creation event:`, error);
    }
});


module.exports = {};
