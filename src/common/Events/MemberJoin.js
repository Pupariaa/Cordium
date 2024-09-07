//@ts-check
'use strict';
require('puparia.getlines.js');

global.client.on('guildMemberAdd', async member => {
    if (member.guild.id !== global.guild.id) return;
    try {
       if(process.env.membercount){
        let count = global.client.getMemberCount(false)
            //TODO: global.Channel.rename('membercount', ?)
       }
    } catch (error) {
        console.error(`${__filename} - Line ${__line} (guildMemberAdd): Error handling guild member add:`, error);
    }
});

module.exports = {};
