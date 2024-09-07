//@ts-check
'use strict';
require('puparia.getlines.js');
const { Events } = require('discord.js');

global.client.on(Events.InteractionCreate, async interaction => {
    if (interaction.member.guild.id !== global.guild.id) return;
    if (interaction.isModalSubmit()) {
        try {

        } catch(e){
            console.error(`${__filename} - Line ${__line} (isModaleSubmit):`, e);

        }
    } else if (interaction.isStringSelectMenu()) {
        try {

        } catch(e){
            console.error(`${__filename} - Line ${__line} (isStringSelectMenu):`, e);

        }
    } else if (interaction.isButton()) {
        try {

        } catch(e){
            console.error(`${__filename} - Line ${__line} (isButton):`, e);

        }
    }

})


module.exports = {}

