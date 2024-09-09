//@ts-check
'use strict';
require('puparia.getlines.js');
const reportEvent = Events.createReportEvent(__filename);

const event = Events.MessageUpdate;
let eventName = String(event);

global.client.on(event, async (oldMessage, newMessage) => {
    if (global.guild.id !== newMessage.guild.id) return;

    try {
        // if (oldMessage.partial || newMessage.partial) {
        //     console.warn(`${__filename} - Line ${__line} (${eventName}): Cannot fetch details for partial messages.`);
        //     return;
        // }
        // if (oldMessage.author?.bot || newMessage.author?.bot) {
        //     console.info(`${__filename} - Line ${__line} (${eventName}): Message updated by a bot, ignoring.`);
        //     return;
        // }

        // if (oldMessage.content === newMessage.content) {
        //     console.info(`${__filename} - Line ${__line} (${eventName}): Message content unchanged, no action needed.`);
        //     return;
        // }

        reportEvent(__line, eventName, 'author.name', newMessage.author.tag, 'channel', newMessage.channel.name, 'content', oldMessage.content, '->', newMessage.content);
        // await handleUpdatedMessageLog(oldMessage, newMessage);
    } catch (err) {
        console.error(`${__filename} - Line ${__line} (${eventName}): `, err);
    }
});

/**
 * Handle logging and other processes for an updated message.
 * @param {import('discord.js').Message} oldMessage - The original message object.
 * @param {import('discord.js').Message} newMessage - The updated message object.
 */
// async function handleUpdatedMessageLog(oldMessage, newMessage) {
//     try {

//     } catch (error) {
//         console.error(`${__filename} - Line ${__line} (handleUpdatedMessageLog): Error in handling updated message log:`, error);
//     }
// }

module.exports = {};
