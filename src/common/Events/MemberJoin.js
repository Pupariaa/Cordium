//@ts-check
'use strict';
const path = require('path');
require('puparia.getlines.js')
const filePath = path.resolve(__dirname, 'guildMemberAdd.js');

global.client.on('guildMemberAdd', async member => {
    try {
       
    } catch (error) {
        console.error(`${filePath} - Line ${__line} (guildMemberAdd): Error handling guild member add:`, error);
    }
});

module.exports = {};
