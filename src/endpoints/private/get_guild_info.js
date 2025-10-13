'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
	],
	handler: async function (params) {
		try {
			if (!global.guild) {
				return { status_code: 503, error: 'Bot not connected to guild' };
			}

			const guild = global.guild;

			return {
				status_code: 200,
				guild: {
					id: guild.id,
					name: guild.name,
					icon: guild.iconURL({ size: 256 }),
					description: guild.description,
					memberCount: guild.memberCount,
					ownerId: guild.ownerId,
					createdAt: guild.createdTimestamp,
					premiumTier: guild.premiumTier,
					premiumSubscriptionCount: guild.premiumSubscriptionCount,
					preferredLocale: guild.preferredLocale,
					verificationLevel: guild.verificationLevel,
					channelCount: guild.channels.cache.size,
					roleCount: guild.roles.cache.size,
					emojiCount: guild.emojis.cache.size
				}
			};
		} catch (err) {
			console.reportError('Error in get_guild_info:', err);
			return { status_code: 500, error: err.message };
		}
	},
};


