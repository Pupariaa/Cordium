'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "channelId", type: "string", mandatory: true, range: [17, 20] },
		{ name: "content", type: "string", mandatory: false, range: [0, 2000] },
		{ name: "embed", type: "object", mandatory: false },
		{ name: "files", type: "array", mandatory: false },
	],
	handler: async function (params) {
		try {
			if (!global.guild) {
				return { status_code: 503, error: 'Bot not connected to guild' };
			}

			if (!params.content && !params.embed && !params.files) {
				return { status_code: 400, error: 'Message must have content, embed, or files' };
			}

			const channel = global.guild.channels.cache.get(params.channelId);
			if (!channel) {
				return { status_code: 404, error: 'Channel not found' };
			}

			if (!channel.isTextBased()) {
				return { status_code: 400, error: 'Channel is not text-based' };
			}

			const messageOptions = {};
			if (params.content) messageOptions.content = params.content;
			if (params.embed) messageOptions.embeds = [params.embed];
			if (params.files) messageOptions.files = params.files;

			const message = await channel.send(messageOptions);

			return {
				status_code: 200,
				message: {
					id: message.id,
					channelId: message.channel.id,
					content: message.content,
					timestamp: message.createdTimestamp,
					url: message.url
				}
			};
		} catch (err) {
			console.reportError('Error in send_message:', err);
			return { status_code: 500, error: err.message };
		}
	},
};

