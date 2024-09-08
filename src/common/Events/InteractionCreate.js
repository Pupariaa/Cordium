//@ts-check
'use strict';
require('puparia.getlines.js');
const reportEvent = Events.createReportEvent(__filename);

const default_handler = (interaction, eventName) => {
    try {
        reportEvent(__line, eventName, 'author.name', interaction.user.tag, 'client.name', interaction.client.user.tag, 'channel.name', interaction.channel.name);
    } catch(err) {
        console.error(`${__filename} - Line ${__line} (${eventName}): `, err);
    }
} 

const event = Events.InteractionCreate;

global.client.on(event, async (interaction) => {
    if (global.guild.id !== interaction.member.guild.id) return;
    let eventName = String(event);

    if (interaction.isAutocomplete()) {
        eventName += '.autocomplete';
        default_handler(interaction, eventName);
    } else if (interaction.isButton()) {
        eventName += '.button';
        default_handler(interaction, eventName);
    } else if (interaction.isMessageComponent()) {
        eventName += '.messageComponent';
        default_handler(interaction, eventName);
    } else if (interaction.isModalSubmit()) {
        eventName += '.modalSubmit';
        default_handler(interaction, eventName);
    } else if (interaction.isChatInputCommand()) {
        eventName += '.chatInputCommand';
        default_handler(interaction, eventName);
    } else if (interaction.isUserContextMenuCommand()) {
        eventName += '.userContextMenuCommand';
        default_handler(interaction, eventName);
    } else if (interaction.isContextMenuCommand()) {
        eventName += '.contextMenuCommand';
        default_handler(interaction, eventName);
    } else if (interaction.isMessageContextMenuCommand()) {
        eventName += '.messageContextMenuCommand';
        default_handler(interaction, eventName);
    } else if (interaction.isStringSelectMenu()) {
        eventName += '.stringSelectMenu';
        default_handler(interaction, eventName);
    } else if (interaction.isUserSelectMenu()) {
        eventName += '.userSelectMenu';
        default_handler(interaction, eventName);
    } else if (interaction.isRoleSelectMenu()) {
        eventName += '.roleSelectMenu';
        default_handler(interaction, eventName);
    } else if (interaction.isMentionableSelectMenu()) {
        eventName += '.mentionableSelectMenu';
        default_handler(interaction, eventName);
    } else if (interaction.isChannelSelectMenu()) {
        eventName += '.channelSelectMenu';
        default_handler(interaction, eventName);
    } else {
        console.error(`${__filename} - Line ${__line} (${eventName}): unknown interaction of type "${interaction.type}"`);
    }
})


module.exports = {}

