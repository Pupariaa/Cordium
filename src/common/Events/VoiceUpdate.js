//@ts-check
'use strict';
require('puparia.getlines.js');
const fs = require('fs');
const path = require('path');

const createdVoiceChannels = new Map();
const createdVoiceChannelsPath = path.join(__dirname, 'createdVoiceChannels.json');
if (fs.existsSync(createdVoiceChannelsPath)) {
    const savedChannels = JSON.parse(fs.readFileSync(createdVoiceChannelsPath, 'utf8'));
    savedChannels.forEach(channel => createdVoiceChannels.set(channel.id, channel));
}

global.client.on('voiceStateUpdate', async (oldState, newState) => {
    if (newState.guild.id !== global.guild.id) return;
    const timestamp = Math.floor(new Date().getTime() / 1000);
    const guild = newState.guild;
    
    try {
        const member = global.Members.readAccount(newState.member.user.id); 
        if (!oldState.channel && newState.channel) {//Join
            console.info(`${__filename} - Line ${__line} (voiceStateUpdate): User ${newState.member.user.tag} joined voice channel ${newState.channel.name}.`);

        }

        if (oldState.channel && !newState.channel) {//Left
            console.info(`${__filename} - Line ${__line} (voiceStateUpdate): User ${oldState.member.user.tag} left voice channel ${oldState.channel.name}.`);        
        }
    } catch (error) {
        console.error(`${__filename} - Line ${__line} (voiceStateUpdate): Error handling voice state update:`, error);
    }
});

module.exports = {};
