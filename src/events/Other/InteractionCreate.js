'use strict';

module.exports = {
	listen: true,
	report: true,
	callback: async function (interaction) {
		if (global.eventsDatabase && global.eventsDatabaseOnline) {
			try {
				await global.eventsDatabase.events.create({
					event_name: 'InteractionCreate',
					user_id: interaction.user.id,
					user_name: interaction.user.username,
					user_avatar: interaction.user.displayAvatarURL({ size: 128 }),
					guild_id: interaction.guild?.id,
					channel_id: interaction.channel?.id,
					event_data: JSON.stringify({
						type: interaction.type,
						commandName: interaction.commandName,
						customId: interaction.customId
					}),
					timestamp: Date.now()
				});
			} catch (err) {
				console.reportError('Error recording InteractionCreate:', err.message);
			}
		}
	}
}