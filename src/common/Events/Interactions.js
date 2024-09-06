// Declaration Imports 
const { Events } = require('discord.js');
const path = require('path')

require('puparia.getlines.js')
const filePath = path.resolve(__dirname, 'interactions.js')


global.client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isModalSubmit()) {
        try {

        } catch(e){
            console.error(`${filePath} - Line ${__line} (isModaleSubmit):`, e);

        }
    } else if (interaction.isStringSelectMenu()) {
        try {

        } catch(e){
            console.error(`${filePath} - Line ${__line} (isStringSelectMenu):`, e);

        }
    } else if (interaction.isButton()) {
        try {

        } catch(e){
            console.error(`${filePath} - Line ${__line} (isButton):`, e);

        }
    }

})


module.exports = {}

