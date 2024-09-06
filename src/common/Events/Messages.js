//@ts-check
'use strict';
const path = require('path');
const { Collection, EmbedBuilder } = require('discord.js');
const userMessages = new Collection();
const SPAM_THRESHOLD = 5;
const TIME_LIMIT = 7000;
const DELETE_TIME_LIMIT = 30000;
const restrictedUsers = new Set();
const fs = require('fs');
const vm = require('vm');
require('puparia.getlines.js')
const filePath = path.resolve(__dirname, 'messageCreate.js');

global.client.on('messageCreate', async (message) => {
    try {
        if (message.member?.isBot()) return;
        if (message.guildId !== global.guildId) return;

        console.info(`${filePath} - Line ${__line} (messageCreate): Message created by ${message.author.tag} in #${message.channel.name}.`);

        try {
            //CLIMarker#06
            await global.triggers.nameOfTrigger(message)

        } catch (err) {
            console.error(`${filePath} - Line ${__line} (messageCreate): Error in handling triggers:`, err);
        }

        // Sandbox execution
        if (message.content.startsWith('!sb')) {
            const code = fs.readFileSync('src/sandbox/index.js', 'utf8');
            const sandbox = {
                console,
                require,
                module,
                exports,
                process,
                __dirname,
                __filename,
                global
            };

            const context = vm.createContext(sandbox);
            try {
                vm.runInContext(code, context);
                console.info(`${filePath} - Line ${__line} (messageCreate): Sandbox code executed.`);
            } catch (err) {
                console.error(`${filePath} - Line ${__line} (messageCreate): Error executing sandbox code:`, err);
            }
        }

        const userId = message.author.id;
        if (!userMessages.has(userId)) { userMessages.set(userId, []) }

        const now = Date.now();
        const timestamps = userMessages.get(userId);
        userMessages.set(userId, timestamps.filter(timestamp => now - timestamp < TIME_LIMIT));
        userMessages.get(userId).push(now);

        if (userMessages.get(userId).length > SPAM_THRESHOLD) {
            console.warn(`${filePath} - Line ${__line} (messageCreate): User ${message.author.tag} exceeded spam threshold.`);
            const guildMember = message.guild.members.cache.get(userId);
            if (guildMember) {
                const restrictedRole = message.guild.roles.cache.get(process.env.restrictRole);
                if (restrictedRole) {
                    await guildMember.roles.add(restrictedRole);
                    console.info(`${filePath} - Line ${__line} (messageCreate): Restricted role added to ${message.author.tag}.`);
                    message.channel.send(`${message.author} a été restreint pour spam.`);
                    const spamMessages = await message.channel.messages.fetch({ limit: 100 });
                    const userSpamMessages = spamMessages.filter(
                        msg => msg.author.id === userId && now - msg.createdTimestamp <= DELETE_TIME_LIMIT
                    );

                    userSpamMessages.forEach(msg => msg.delete().catch(error => {
                        if (error.code !== 10008) {
                            console.error(`${filePath} - Line ${__line} (messageCreate): Failed to delete message:`, error);
                        }
                    }));

                    const formattedMessages = userSpamMessages.map(msg => `- ${msg.content}`).join('\n');
                    const embed = new EmbedBuilder()
                        .setTitle("Restriction")
                        .setDescription(`L'utilisateur <@${userId}> (${message.member.user.username}) a été restreint automatiquement suite à un flood dans le salon <#${message.channel.id}>`)
                        .setColor("#ff0000")
                        .addFields({ name: "Messages de spam supprimés", value: formattedMessages || 'Aucun message trouvé.' });

                    global.Channel.send('staff', { embeds: [embed] });
                    restrictedUsers.add(userId);
                    console.info(`${filePath} - Line ${__line} (messageCreate): Spam messages deleted and logged for ${message.author.tag}.`);
                }
            }
            userMessages.delete(userId);
        }



    } catch (e) {
        console.error(`${filePath} - Line ${__line} (messageCreate): Error in messageCreate event handler:`, e);
    }
});

module.exports = {};
