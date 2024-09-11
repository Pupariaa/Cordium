const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { Collection } = require('discord.js');
require('puparia.getlines.js');

const report = console.createReportFunction(__filename);
const reportError = console.createReportErrorFunction(__filename);

class CommandHandler {
    constructor() {
        console.info(`START: Initializing CommandHandler`);
        this.commandsPath = './src/commands';
        this.rest = new REST({ version: '10' }).setToken(process.env.client_token);
    }

    /**
     * Loads commands from the 'handlers' directory and registers them with the client.
     */
    loadCommands() {
        try {
            console.info(`START: Loading commands`);

            // Initialize client.commands if it doesn't exist
            if (!global.client.commands) {
                global.client.commands = new Collection();
                console.success(`START: Initialized client.commands collection`);
            }

            // Read command files from the handlers directory
            const commandFiles = fs.readdirSync(this.commandsPath);
            for (const file of commandFiles) {
                try {
                    const command = require(path.join('..',this.commandsPath, file));
                    if ('data' in command && 'execute' in command) {
                        global.client.commands.set(command.data.name, command);
                        console.success(`START: Command loaded: ${command.data.name}`);
                    } else {
                        console.warn(`START: The command at ${file} is missing a required "data" or "execute" property`);
                    }
                } catch (err) {
                    reportError(__line, functionName, `START: Error loading command from file ${file}:`, err);
                }
            }

        } catch (err) {
            reportError(__line, functionName, `START: Error loading commands:`, err);
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
            console.info(`START: Deploying commands to Discord API`);
            const data = await this.rest.put(
                Routes.applicationGuildCommands(process.env.client_id, process.env.discord_guild_id),
                { body: commands }
            );
            console.success(`START: ${data.length} commands deployed successfully`);
        } catch (err) {
            reportError(__line, functionName, `START: Error deploying commands:`, err);
        }
    }
}

module.exports = CommandHandler;
