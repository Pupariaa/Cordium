//@ts-check
'use strict';
require('puparia.getlines.js');
const reportEvent = Events.createReportEvent(__filename);

const event = Events.VoiceStateUpdate;
let eventName = String(event);

const { AuditLogEvent } = require('discord.js');
const fs = require('fs');
const path = require('path');

const createdVoiceChannels = new Map();
const createdVoiceChannelsPath = path.join(__dirname, 'createdVoiceChannels.json');
if (fs.existsSync(createdVoiceChannelsPath)) {
    const savedChannels = JSON.parse(fs.readFileSync(createdVoiceChannelsPath, 'utf8'));
    savedChannels.forEach(channel => createdVoiceChannels.set(channel.id, channel));
}

let count = 3;

global.client.on(event, async (oldState, newState) => {
    if (global.guild.id !== newState.guild.id) return;

    // const timestamp = Math.floor(new Date().getTime() / 1000);
    try {
        let state = oldState;
        if (oldState.channel) {
            if (newState.channel) {
                // partage decran / miute / etc
                reportEvent(__line, eventName, 'partage decran / miute / etc', null);
                // -------------------------------------------
            }
            else {
                const members = await global.Channel.voice.getMembers(state.channel);
                const latestAuditLog = await global.guild.latestAuditLog();
                const now = Math.floor(new Date().getTime());
                // console.log('latestAuditLog.createdTimestamp = ', latestAuditLog.createdTimestamp);
                // console.log('now = ', now);
                const DT = Math.abs(latestAuditLog.createdTimestamp - now);
                console.log(DT, latestAuditLog.extra.count, count);
                // console.log(members);
                // console.log(state.member);
                // console.log(latestAuditLog);
                if (latestAuditLog.action === AuditLogEvent.MemberDisconnect && (DT < 2000 || latestAuditLog.extra.count - count === 1)) {
                    eventName += '.disconnect';
                    count = latestAuditLog.extra.count;
                    reportEvent(__line, eventName, 'author.name', 'TODO', 'target.name', state.member.user.tag,'channel.name', state.channel.name);
                    // -------------------------------------------
                    
                    return;
                }
                eventName += '.leave';
                reportEvent(__line, eventName, 'author.name', state.member.user.tag, 'channel.name', state.channel.name);
                // -------------------------------------------
            }
        }
        else {
            state = newState;
            if (newState.channel) {
                eventName += '.join';
                reportEvent(__line, eventName, 'author.name', state.member.user.tag, 'channel.name', state.channel.name);
                // -------------------------------------------
            }
            else {
                console.error(`${__filename} - Line ${__line} (${eventName}): impossible case reached`);
                // -------------------------------------------
            }
        }
    } catch (err) {
        console.error(`${__filename} - Line ${__line} (${eventName}): `, err);
    }
});

module.exports = {};
