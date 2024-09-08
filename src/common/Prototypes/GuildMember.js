'use strict';
const { GuildMember } = require('discord.js');

GuildMember.prototype.hasRole = function(roleName) {
    const role = this.guild.roles.cache.find(role => role.name === roleName);
    return role ? this.roles.cache.has(role.id) : false;
};

GuildMember.prototype.isBot = function() {
    return this.user.bot;
};