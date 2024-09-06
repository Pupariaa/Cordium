//@ts-check
'use strict';
const path = require('path');
require('puparia.getlines.js')
const filePath = path.resolve(__dirname, 'messageUpdate.js'); 

global.client.on('messageUpdate', async (oldMessage, newMessage) => {
    try {
        if (oldMessage.partial || newMessage.partial) {
            console.warn(`${filePath} - Line ${__line} (messageUpdate): Cannot fetch details for partial messages.`);
            return;
        }
        if (oldMessage.author?.bot || newMessage.author?.bot) {
            console.info(`${filePath} - Line ${__line} (messageUpdate): Message updated by a bot, ignoring.`);
            return;
        }

        if (oldMessage.content === newMessage.content) {
            console.info(`${filePath} - Line ${__line} (messageUpdate): Message content unchanged, no action needed.`);
            return;
        }

        console.info(`${filePath} - Line ${__line} (messageUpdate): Message updated in channel #${newMessage.channel.name} by ${newMessage.author.tag}.`);
        console.info(`${filePath} - Line ${__line} (messageUpdate): Old Content: "${oldMessage.content}"`);
        console.info(`${filePath} - Line ${__line} (messageUpdate): New Content: "${newMessage.content}"`);

        await handleUpdatedMessageLog(oldMessage, newMessage);

    } catch (error) {
        console.error(`${filePath} - Line ${__line} (messageUpdate): Error handling message update event:`, error);
    }
});

/**
 * Handle logging and other processes for an updated message.
 * @param {import('discord.js').Message} oldMessage - The original message object.
 * @param {import('discord.js').Message} newMessage - The updated message object.
 */
async function handleUpdatedMessageLog(oldMessage, newMessage) {
    try {
        

    } catch (error) {
        console.error(`${filePath} - Line ${__line} (handleUpdatedMessageLog): Error in handling updated message log:`, error);
    }
}

module.exports = {};
