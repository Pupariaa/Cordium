//@ts-check
'use strict';
const fs = require('fs');
const path = require('path');
const { PermissionFlagsBits, ChannelType } = require('discord.js');
require(path.resolve(__dirname, '../../logutils')); 
const filePath = path.resolve(__dirname, 'voiceStateUpdate.js');

const createdVoiceChannels = new Map();
const createdVoiceChannelsPath = path.join(__dirname, 'createdVoiceChannels.json');
if (fs.existsSync(createdVoiceChannelsPath)) {
    const savedChannels = JSON.parse(fs.readFileSync(createdVoiceChannelsPath, 'utf8'));
    savedChannels.forEach(channel => createdVoiceChannels.set(channel.id, channel));
}

global.client.on('voiceStateUpdate', async (oldState, newState) => {
    const functionName = 'voiceStateUpdate';
    const timestamp = Math.floor(new Date().getTime() / 1000);
    const guild = newState.guild;
    
    try {
        const member = global.Members.readAccount(newState.member.user.id); 
        if (!oldState.channel && newState.channel) {//Join
            console.info(`${filePath} - Line ${__line} (${functionName}): User ${newState.member.user.tag} joined voice channel ${newState.channel.name}.`);

        }

        if (oldState.channel && !newState.channel) {//Left
            console.info(`${filePath} - Line ${__line} (${functionName}): User ${oldState.member.user.tag} left voice channel ${oldState.channel.name}.`);        
        }

    } catch (error) {
        console.error(`${filePath} - Line ${__line} (${functionName}): Error handling voice state update:`, error);
    }
});

module.exports = {};
