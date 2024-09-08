//@ts-check
'use strict';
require('puparia.getlines.js');
const reportEvent = Events.createReportEvent(__filename);

const event = Events.GuildMemberAdd;

global.client.on(event, async (member) => {
    if (global.guild.id !== member.guild.id) return;
    let eventName = String(event);

    try {
        reportEvent(__line, eventName, 'user.name', member.user.tag);
        if(process.env.membercount){
            let count = global.client.getMemberCount(false)
                //TODO: global.Channel.rename('membercount', ?)
        }
    } catch (err) {
        console.error(`${__filename} - Line ${__line} (${eventName}): `, err);
    }
});

module.exports = {};
