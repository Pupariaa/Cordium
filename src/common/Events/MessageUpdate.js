//@ts-check
'use strict';
require('puparia.getlines.js');

global.client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (newMessage.guild.id !== global.guild.id) return;
    try {
        if (oldMessage.partial || newMessage.partial) {
            console.warn(`${__filename} - Line ${__line} (messageUpdate): Cannot fetch details for partial messages.`);
            return;
        }
        if (oldMessage.author?.bot || newMessage.author?.bot) {
            console.info(`${__filename} - Line ${__line} (messageUpdate): Message updated by a bot, ignoring.`);
            return;
        }

        if (oldMessage.content === newMessage.content) {
            console.info(`${__filename} - Line ${__line} (messageUpdate): Message content unchanged, no action needed.`);
            return;
        }

        console.info(`${__filename} - Line ${__line} (messageUpdate): Message updated in channel #${newMessage.channel.name} by ${newMessage.author.tag}.`);
        console.info(`${__filename} - Line ${__line} (messageUpdate): Old Content: "${oldMessage.content}"`);
        console.info(`${__filename} - Line ${__line} (messageUpdate): New Content: "${newMessage.content}"`);

        await handleUpdatedMessageLog(oldMessage, newMessage);
    } catch (error) {
        console.error(`${__filename} - Line ${__line} (messageUpdate): Error handling message update event:`, error);
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
        console.error(`${__filename} - Line ${__line} (handleUpdatedMessageLog): Error in handling updated message log:`, error);
    }
}

module.exports = {};
