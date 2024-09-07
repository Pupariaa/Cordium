//@ts-check
'use strict';
require('puparia.getlines.js');

global.client.on('roleUpdate', async (oldRole, newRole) => {
    if (newRole.guild.id !== global.guild.id) return;
    try {
        if (oldRole.name === newRole.name && oldRole.hexColor === newRole.hexColor && oldRole.mentionable === newRole.mentionable) {
            console.info(`${__filename} - Line ${__line} (roleUpdate): No significant changes in role update for ${newRole.name} (ID: ${newRole.id}).`);
            return;
        }

        console.info(`${__filename} - Line ${__line} (roleUpdate): Role updated: ${newRole.name} (ID: ${newRole.id}).`);
    } catch (error) {
        console.error(`${__filename} - Line ${__line} (roleUpdate): Error handling role update event:`, error);
    }
});



module.exports = {};
