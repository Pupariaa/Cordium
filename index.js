//@ts-check
require('dotenv').config({ path: './config.env' });
new (require('./src/common/Discord_instance'))()
const { Events } = require('discord.js');


global.client.on('ready', async () => {
    
    require('./eventsLoggers');
    console.info('Discord bot is started');


    process.on('uncaughtException', (err) => {
        const message = err.message;
        console.error(message);
    });
    process.on('unhandledRejection', (reason, promise) => {
        if (reason instanceof Error) {
            console.error(reason.message);
        } else {
            console.error(reason);
        }
    });

    global.client.invitesCache = new Map();
    const guild = global.client.guilds.cache.get(process.env.discord_guid);
    const invites = await guild.invites.fetch();
    invites.forEach(invite => global.client.invitesCache.set(invite.code, invite.uses));

    require('./src/common/Events/MemberJoin');
    require('./src/common/Events/MemberLeft');
    require('./src/common/Events/Messages');
    require('./src/common/Events/ChannelCreate');
    require('./src/common/Events/ChannelUpdate');
    require('./src/common/Events/ChannelDelete');
    require('./src/common/Events/GuildBanAdd');
    require('./src/common/Events/InvitCreate');
    require('./src/common/Events/InvitDelete');
    require('./src/common/Events/MessageDelete');
    require('./src/common/Events/MessageUpdate');
    require('./src/common/Events/RoleCreate');
    require('./src/common/Events/RoleUpdate');
    require('./src/common/Events/Interactions');
    require('./src/common/Events/VoiceUpdate');



    await global.Channel.send('name of channel', 'content')


    global.client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            await interaction.reply('not a command')
            console.error(`DISCORD: No command matching ${interaction.commandName} was found.`)
            return;
        }
        try {
            // await interaction.reply('Commands disable')
            await command.execute(interaction);
        } catch (error) {
            console.error(`DISCORD: Not exectuable command ${interaction.commandName} ${error}.`)
            console.error(error)
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    })
})