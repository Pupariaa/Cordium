// Declaration Imports 
const { Events, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const path = require('path')
const fs = require('fs');



global.client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isModalSubmit()) {
        
    } else if (interaction.isStringSelectMenu()) {

    } else if (interaction.isButton()) {
       
    }

})


module.exports = {}

