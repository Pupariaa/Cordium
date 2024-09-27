'use strict';
const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

const cmdName = 'clean';
const cmdDescription = 'cleans the current channel';

const urlRegex = new RegExp('https?:\\\/\\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\\/=]*)', '');

const cooldown = 2;
const batchSize = 100;
const getMinutesRemaining = (remainingMessages) => Math.ceil(remainingMessages * cooldown / 60);
const shouldDelete = (msg) => {
    if (msg.attachments.size > 0) return false;
    if (msg.embeds.length > 0) return false;
    if (urlRegex.test(msg.content)) return false;
    if (Object.values(msg.attachments).some((attachment) => attachment.width && attachment.height)) return false;
    return true;
};

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
            const channel = interaction.channel;
            const messagesToDelete = await channel.fetchAllMessages(
                global.channels.fetchAllMessages.scanUp,
                (message, r) => {
                    if (!shouldDelete(message)) return;
                    if (r.currentBatch.length >= batchSize) {
                        r.batches.push(r.currentBatch);
                        r.currentBatch = [];
                    }
                    r.currentBatch.push(message);
                },
                (lastId) => ({ before: lastId }),
                null,
                { batches: [], currentBatch: [] }
            );
            if (messagesToDelete.currentBatch.length > 0) messagesToDelete.batches.push(messagesToDelete.currentBatch);

            const deletedMessageIds = [];
            await Promise.all(
                messagesToDelete.batches.map(async (batch) => {
                    const ids = Object.keys(await channel.bulkDelete(batch, true));
                    deletedMessageIds.push(...ids);
                })
            );

            const filteredMessages = messagesToDelete.batches
                .flat()
                .filter(msg => !deletedMessageIds.includes(msg.id));
            const totalMessages = filteredMessages.length;
            if (totalMessages > 0) {
                let deletedCount = 0;

                await interaction.reply({
                    ephemeral: true,
                    content: `Deleting messages older than 2 weeks (${getMinutesRemaining(totalMessages)} min(s) remaining)`,
                });

                for (const msg of filteredMessages) {
                    console.log(`cleaning ${msg.content} from ${msg.author.username} in #${msg.channel.name}`);
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
