//@ts-check
'use strict';
const path = require('path');
require('puparia.getlines.js')
const filePath = path.resolve(__dirname, 'roleUpdate.js');

global.client.on('roleUpdate', async (oldRole, newRole) => {
    try {
        
        if (oldRole.name === newRole.name && oldRole.hexColor === newRole.hexColor && oldRole.mentionable === newRole.mentionable) {
            console.info(`${filePath} - Line ${__line} (roleUpdate): No significant changes in role update for ${newRole.name} (ID: ${newRole.id}).`);
            return;
        }

        console.info(`${filePath} - Line ${__line} (roleUpdate): Role updated: ${newRole.name} (ID: ${newRole.id}).`);


    } catch (error) {
        console.error(`${filePath} - Line ${__line} (roleUpdate): Error handling role update event:`, error);
    }
});



module.exports = {};
