//@ts-check
'use strict';
const path = require('path');
require('puparia.getlines.js')
const filePath = path.resolve(__dirname, 'roleCreate.js');

global.client.on('roleCreate', async (role) => {
    try {
        console.info(`${filePath} - Line ${__line} (roleCreate): Role created: ${role.name} (ID: ${role.id}).`);

    } catch (error) {
        console.error(`${filePath} - Line ${__line} (roleCreate): Error handling role creation event:`, error);
    }
});


module.exports = {};
