console.log('--------------------------------------------SANDBOX OUTPUT START--------------------------------------------')
const fs = require('fs');
const path = require('path');
const guild = global.client.guilds.cache.get(process.env.discord_guid);

global.Channel.send('general', 'content')
