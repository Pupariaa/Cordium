//@ts-check
'use strict';
const path = require('path');
require(path.resolve(__dirname, '../../logutils'));
const filePath = path.resolve(__dirname, 'guildMemberAdd.js');

global.client.on('guildMemberAdd', async member => {
    const functionName = 'guildMemberAdd';
    try {
       
    } catch (error) {
        console.error(`${filePath} - Line ${__line} (${functionName}): Error handling guild member add:`, error);
    }
});

module.exports = {};
