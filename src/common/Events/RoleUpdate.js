//@ts-check
'use strict';
const path = require('path');
require(path.resolve(__dirname, '../../logutils'));
const filePath = path.resolve(__dirname, 'roleUpdate.js');
global.client.on('roleUpdate', async (oldRole, newRole) => {
    const functionName = 'roleUpdate';
    try {
        
        if (oldRole.name === newRole.name && oldRole.hexColor === newRole.hexColor && oldRole.mentionable === newRole.mentionable) {
            console.info(`${filePath} - Line ${__line} (${functionName}): No significant changes in role update for ${newRole.name} (ID: ${newRole.id}).`);
            return;
        }

        console.info(`${filePath} - Line ${__line} (${functionName}): Role updated: ${newRole.name} (ID: ${newRole.id}).`);


    } catch (error) {
        console.error(`${filePath} - Line ${__line} (${functionName}): Error handling role update event:`, error);
    }
});



module.exports = {};
