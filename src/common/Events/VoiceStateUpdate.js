//@ts-check
'use strict';
require('puparia.getlines.js');
const reportEvent = Events.createReportEvent(__filename);

const fs = require('fs');
const path = require('path');

const createdVoiceChannels = new Map();
const createdVoiceChannelsPath = path.join(__dirname, 'createdVoiceChannels.json');

if (fs.existsSync(createdVoiceChannelsPath)) {
    const savedChannels = JSON.parse(fs.readFileSync(createdVoiceChannelsPath, 'utf8'));
    savedChannels.forEach(channel => createdVoiceChannels.set(channel.id, channel));
}

const event = Events.VoiceStateUpdate;

global.client.on(event, async (oldState, newState) => {
    if (global.guild.id !== newState.guild.id) return;
    let eventName = String(event);

    // const timestamp = Math.floor(new Date().getTime() / 1000);
    try {
        let state = oldState;
        if (oldState.channel && !newState.channel) {
            eventName += '.leave';
        }
        if (!oldState.channel && newState.channel) {
            state = newState;
            eventName += '.join';
        }
        reportEvent(__line, eventName, 'author.name', state.member.user.tag, 'channel.name', state.channel.name);
    } catch (err) {
        console.error(`${__filename} - Line ${__line} (${eventName}): `, err);
    }
});

module.exports = {};
