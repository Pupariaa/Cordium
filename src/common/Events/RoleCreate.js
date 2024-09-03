//@ts-check
'use strict';
const path = require('path');
require(path.resolve(__dirname, '../../logutils')); 
const filePath = path.resolve(__dirname, 'roleCreate.js');
global.client.on('roleCreate', async (role) => {
    const functionName = 'roleCreate';
    try {
        console.info(`${filePath} - Line ${__line} (${functionName}): Role created: ${role.name} (ID: ${role.id}).`);

    } catch (error) {
        console.error(`${filePath} - Line ${__line} (${functionName}): Error handling role creation event:`, error);
    }
});


module.exports = {};
