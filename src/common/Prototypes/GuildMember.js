const { GuildMember } = require('discord.js');
GuildMember.prototype.hasRole = function(roleName) {
    const role = this.guild.roles.cache.find(role => role.name === roleName);
    return role ? this.roles.cache.has(role.id) : false;
};
GuildMember.prototype.isModerator = function() {
    return this.hasRole('Modérateur');
};
GuildMember.prototype.isAdministrator = function() {
    return this.hasRole('Administrateur');
};
GuildMember.prototype.isHelper = function() {
    return this.hasRole('Helper');
};
GuildMember.prototype.isAnimator = function() {
    return this.hasRole('Animateur');
};
GuildMember.prototype.isFondator = function() {
    return this.hasRole('Fondateur');
};
GuildMember.prototype.isBot = function() {
    return this.user.bot;
};