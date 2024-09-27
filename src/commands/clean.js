'use strict';
const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

const cmdName = 'clean';
const cmdDescription = 'cleans the current channel';

const urlRegex = new RegExp('https?:\\\/\\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\\/=]*)', '');

const cooldown = 2;
const getMinutesRemaining = (remainingMessages) => Math.ceil(remainingMessages * cooldown / 60);
const shouldDelete = (msg) =>
    msg.attachments.size === 0
    && msg.embeds.length === 0
    && !urlRegex.test(msg.content);

module.exports = {
    data: new SlashCommandBuilder()
        .setName(cmdName)
        .setDescription(cmdDescription),

    /**
     * Executes the 'clean' command.
     * @param {Object} interaction - The interaction object from Discord.js.
     */
    async execute(interaction) {
        try {
            const messagesToDelete = [];
            const channel = interaction.channel;
            (await channel.fetchAllMessages(
                global.channels.fetchAllMessages.scanUp,
                (message, r) => r.push(message),
                (lastId) => ({ before: lastId }),
                null
            )).forEach(msg => {
                if (shouldDelete(msg)) messagesToDelete.push(msg);
            });
            messagesToDelete.forEach(msg => {
                console.report(`Deleting "${msg.content}" from ${msg.author.username} in #${msg.channel.name}`);
            });
            const bulkDeletePromise = channel.bulkDelete(messagesToDelete, true);

            const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
            const filteredMessages = messagesToDelete.filter(msg => msg.createdTimestamp < twoWeeksAgo);
            const totalMessages = filteredMessages.length;
            if (totalMessages > 0) {
                let deletedCount = 0;

                await interaction.reply({
                    ephemeral: true,
                    content: `Deleting messages older than 2 weeks (${getMinutesRemaining(totalMessages)} min(s) remaining)`,
                });

                for (const msg of filteredMessages) {
                    await msg.delete();
                    const waitPromise = wait(cooldown * 1000);

                    deletedCount++;
                    if (deletedCount % 60 === 0) {
                        await interaction.editReply({
                            content: `Deleting messages older than 2 weeks (${getMinutesRemaining(totalMessages - deletedCount)} min(s) remaining)`,
                        });
                    }

                    await waitPromise;
                }

                await bulkDeletePromise;

                await interaction.editReply({
                    content: 'done',
                });
            } else {
                await interaction.reply({
                    ephemeral: true,
                    content: 'done',
                });
            }
        } catch (err) {
            console.reportError(err);

            await (interaction.replied || interaction.deferred ? interaction.followUp : interaction.reply)({
                ephemeral: true,
                content: `${cmdName} failed`,
            });
        }
        await wait(5000);
        await interaction.deleteReply();
    }
};
