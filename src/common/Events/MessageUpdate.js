//@ts-check
'use strict';
const path = require('path');
require(path.resolve(__dirname, '../../logutils')); 
const filePath = path.resolve(__dirname, 'messageUpdate.js'); 

global.client.on('messageUpdate', async (oldMessage, newMessage) => {
    const functionName = 'messageUpdate';
    try {
        if (oldMessage.partial || newMessage.partial) {
            console.warn(`${filePath} - Line ${__line} (${functionName}): Cannot fetch details for partial messages.`);
            return;
        }
        if (oldMessage.author?.bot || newMessage.author?.bot) {
            console.info(`${filePath} - Line ${__line} (${functionName}): Message updated by a bot, ignoring.`);
            return;
        }

        if (oldMessage.content === newMessage.content) {
            console.info(`${filePath} - Line ${__line} (${functionName}): Message content unchanged, no action needed.`);
            return;
        }

        console.info(`${filePath} - Line ${__line} (${functionName}): Message updated in channel #${newMessage.channel.name} by ${newMessage.author.tag}.`);
        console.info(`${filePath} - Line ${__line} (${functionName}): Old Content: "${oldMessage.content}"`);
        console.info(`${filePath} - Line ${__line} (${functionName}): New Content: "${newMessage.content}"`);

        await handleUpdatedMessageLog(oldMessage, newMessage);

    } catch (error) {
        console.error(`${filePath} - Line ${__line} (${functionName}): Error handling message update event:`, error);
    }
});

/**
 * Handle logging and other processes for an updated message.
 * @param {import('discord.js').Message} oldMessage - The original message object.
 * @param {import('discord.js').Message} newMessage - The updated message object.
 */
async function handleUpdatedMessageLog(oldMessage, newMessage) {
    const functionName = 'handleUpdatedMessageLog';
    try {
        

    } catch (error) {
        console.error(`${filePath} - Line ${__line} (${functionName}): Error in handling updated message log:`, error);
    }
}

module.exports = {};
