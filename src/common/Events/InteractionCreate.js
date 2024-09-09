//@ts-check
'use strict';
require('puparia.getlines.js');
const reportEvent = Events.createReportEvent(__filename);

const event = Events.InteractionCreate;
let eventName = String(event);

const default_handler = (interaction) => {
    try {
        reportEvent(__line, eventName, 'author.name', interaction.user.tag, 'client.name', interaction.client.user.tag, 'channel.name', interaction.channel.name);
    } catch(err) {
        console.error(`${__filename} - Line ${__line} (${eventName}): `, err);
    }
} 

function reportChatInputCommand(interaction) {
    const functionName = 'reportChatInputCommand';
    eventName += '.chatInputCommand';
    try {
        // console.log(interaction.options);
        // console.log(JSON.stringify(interaction.options, null, 4));
        let cmd = `/${interaction.commandName}`;
        for (const option of interaction.options._hoistedOptions) {
            switch (option.type) {
                case 3:
                    cmd += ` ${option.name}: ${option.value}`;
                    break;
                case 6:
                    cmd += ` user: @${option.member.displayName}`;
                    break;
                default:
                    console.warn(`${__filename} - Line ${__line} (${functionName}): unsupported option type: ${option.type}`);
                    break;
            }
        }
        reportEvent(__line, eventName, 'author.name', interaction.user.tag, 'client.name', interaction.client.user.tag, 'channel.name', interaction.channel.name, 'command', cmd);
    } catch(err) {
        console.error(`${__filename} - Line ${__line} (${eventName}): `, err);
    }
}

global.client.on(event, async (interaction) => {
    if (global.guild.id !== interaction.member.guild.id) return;

    if (interaction.isAutocomplete()) {
        eventName += '.autocomplete';
        default_handler(interaction);
    } else if (interaction.isButton()) {
        eventName += '.button';
        default_handler(interaction);
    } else if (interaction.isMessageComponent()) {
        eventName += '.messageComponent';
        default_handler(interaction);
    } else if (interaction.isModalSubmit()) {
        eventName += '.modalSubmit';
        default_handler(interaction);
    } else if (interaction.isChatInputCommand()) {
        reportChatInputCommand(interaction);
    } else if (interaction.isUserContextMenuCommand()) {
        eventName += '.userContextMenuCommand';
        default_handler(interaction);
    } else if (interaction.isContextMenuCommand()) {
        eventName += '.contextMenuCommand';
        default_handler(interaction);
    } else if (interaction.isMessageContextMenuCommand()) {
        eventName += '.messageContextMenuCommand';
        default_handler(interaction);
    } else if (interaction.isStringSelectMenu()) {
        eventName += '.stringSelectMenu';
        default_handler(interaction);
    } else if (interaction.isUserSelectMenu()) {
        eventName += '.userSelectMenu';
        default_handler(interaction);
    } else if (interaction.isRoleSelectMenu()) {
        eventName += '.roleSelectMenu';
        default_handler(interaction);
    } else if (interaction.isMentionableSelectMenu()) {
        eventName += '.mentionableSelectMenu';
        default_handler(interaction);
    } else if (interaction.isChannelSelectMenu()) {
        eventName += '.channelSelectMenu';
        default_handler(interaction);
    } else {
        console.error(`${__filename} - Line ${__line} (${eventName}): unknown interaction of type "${interaction.type}"`);
    }
})


module.exports = {}

