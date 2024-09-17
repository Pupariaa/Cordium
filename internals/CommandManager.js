const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Collection } = require('discord.js');
const { Routes } = require('discord-api-types/v10');


class CommandHandler {
    constructor() {
        this.rest = new REST({ version: '10' }).setToken(global.clientToken);
        if (!global.client.commands) global.client.commands = new Collection();
    }

    /**
     * Loads commands from the 'handlers' directory and registers them with the client.
     */
    loadCommands() {
        try {
            console.report('Loading commands...');

            // Read command files from the handlers directory
            const commandFiles = fs.readdirSync(global.commandsFolder);
            for (const file of commandFiles) {
                try {
                    const command = require(path.join(global.commandsFolder, file));
                    if ('data' in command && 'execute' in command) {
                        global.client.commands.set(command.data.name, command);
                        console.report(`Command loaded: ${command.data.name}`);
                    } else {
                        console.reportWarn(`The command at ${file} is missing a required "data" or "execute" property`);
                    }
                } catch (err) {
                    console.reportError(`Error loading command from file ${file}:`, err);
                }
            }

        } catch (err) {
            console.reportError(`Error loading commands:`, err);
        }
    }

    /**
     * Deploys the commands to the Discord application for a specific guild.
     */
    async deployCommands() {

        const commands = [];

        // Convert commands to a format suitable for Discord API
        global.client.commands.forEach(cmd => commands.push(cmd.data.toJSON()));

        try {
            await this.rest.put(
                Routes.applicationGuildCommands(global.clientId, global.discordGuildId),
                { body: commands }
            );

            console.report('Commands deployed successfully');
        } catch (err) {
            console.reportError(`Error deploying commands:`, err);
        }
    }
}

module.exports = CommandHandler;
