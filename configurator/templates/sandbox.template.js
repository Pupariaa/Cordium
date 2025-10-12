'use strict';

require('extend-console');

report('--------------------------------------------SANDBOX OUTPUT START--------------------------------------------');

const fs = require('fs');
const path = require('path');
const guild = global.client.guilds.cache.get(global.discordGuildId);

report('Guild:', guild.name);
report('Member count:', guild.memberCount);

report('--------------------------------------------SANDBOX OUTPUT END----------------------------------------------');


