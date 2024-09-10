'use strict';
const { SlashCommandBuilder } = require('discord.js');
require('puparia.getlines.js');

const wait = require('node:timers/promises').setTimeout;

const cmdName = 'clean';
const cmdDescription = 'cleans the server';

const lakazatong_id = '325030485027979264';

const urlRegex = new RegExp('https?:\\\/\\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\\/=]*)', '');

function append_messages_to_delete_from_lakazatong(messages, messagesToDelete) {
    const sauce_msg_regex = new RegExp('\\[sauce\\]\\(<[^>]+>\\)', '');
    let i = messages.length - 1;
    while (i >= 0) {
        const msg = messages[i];
        if (msg.author.id !== lakazatong_id) {
            i--;
            continue;
        }
        const content = msg.content;
        if (!content.startsWith('https://x.com')
            && !content.startsWith('https://twitter.com')
            && !content.startsWith('https://cosplaytele.com')
            && !content.startsWith('https://cosplaythots.com')
            && (msg.attachments.size === 0 || !sauce_msg_regex.test(content))) {
            messagesToDelete.push(msg);
        }
        messages.splice(i, 1);
        i--;
    }
}

function append_messages_to_delete_by_default(messages, messagesToDelete) {
    messages.forEach(msg => {
        if (msg.attachments.size === 0
            && msg.embeds.length === 0
            && !urlRegex.test(msg.content)
        ) {
            // if (!(msg in messagesToDelete)) { messagesToDelete.add(msg); }
            // if (msg.author.id === lakazatong_id) {
            //     console.error('frr?');
            // }
            messagesToDelete.push(msg);
        }
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName(cmdName)
        .setDescription(cmdDescription),

    /**
     * Executes the 'clean' command.
     * @param {Object} interaction - The interaction object from Discord.js.
     */
    async execute(interaction) {
        const functionName = 'execute';
        try {
            const messagesToDelete = [];
            
            const promises = [];

            for (const [ channelName, channelAlias ] of Object.entries(global.channels.text.channels)) {
                if (!channelAlias.tags.includes('boulot')) continue;
                const channel = global.channels.text.getByName(channelName);
                const messages = await channel.fetchAllMessages();
                messagesToDelete.length = 0;
                append_messages_to_delete_from_lakazatong(messages, messagesToDelete);
                // messages.forEach(msg => {
                //     if (msg.author.id === lakazatong_id) {
                //         console.error('frr?');
                //     }
                // });
                append_messages_to_delete_by_default(messages, messagesToDelete);
                messagesToDelete.forEach(msg => {
                    console.log(`Deleting ${msg.content} from ${msg.author.username} in ${channelName}`);
                });
                promises.push(channel.bulkDelete(messagesToDelete, true));
                // promises.push(wait(1000));
            }

            await Promise.all(promises);

            await interaction.reply({
                content: 'done',
                ephemeral: true
            });
            await wait(5000);
            await interaction.deleteReply();

        } catch (err) {
            console.error(`${__filename} - Line ${__line} (${functionName}): `, err);
            await interaction.reply({ content: `${cmdName} failed`, ephemeral: true });
            await wait(5000);
            await interaction.deleteReply();
        }
    }
};
