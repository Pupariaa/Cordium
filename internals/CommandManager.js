const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
// const { Routes } = require('discord-api-types/v10');
const { Collection } = require('discord.js');

const { __cfn, __cf } = eval(require(`current_filename`));
const { report, reportWarn, reportError } = console.createReports(__cfn);

class CommandHandler {
    constructor() {
        const functionName = 'constructor';
        report(__line, functionName, 'Initializing CommandHandler...');
        this.commandsPath = './src/commands';
        this.rest = new REST({ version: '10' }).setToken(process.env.client_token);
    }

    /**
     * Loads commands from the 'handlers' directory and registers them with the client.
     */
    loadCommands() {
        const functionName = 'loadCommands';
        try {
            report(__line, functionName, 'Loading commands...');

            // Initialize client.commands if it doesn't exist
            if (!global.client.commands) {
                global.client.commands = new Collection();
                report(__line, functionName, 'client.commands collection initialized');
            }

            // Read command files from the handlers directory
            const commandFiles = fs.readdirSync(this.commandsPath);
            for (const file of commandFiles) {
                try {
                    const command = require(path.join('..',this.commandsPath, file));
                    if ('data' in command && 'execute' in command) {
                        global.client.commands.set(command.data.name, command);
                        report(__line, functionName, `Command loaded: ${command.data.name}`);
                    } else {
                        reportWarn(__line, functionName, `The command at ${file} is missing a required "data" or "execute" property`);
                    }
                } catch (err) {
                    reportError(__line, functionName, `Error loading command from file ${file}:`, err);
                }
            }

        } catch (err) {
            reportError(__line, functionName, `Error loading commands:`, err);
        }
    }

    /**
     * Deploys the commands to the Discord application for a specific guild.
     */
    async deployCommands() {
        const functionName = 'deployCommands';

        const commands = [];

        // Convert commands to a format suitable for Discord API
        global.client.commands.forEach(cmd => commands.push(cmd.data.toJSON()));

        try {
            report(__line, functionName, 'Deployinging commands to Discord API...');
            await this.rest.put(
                Routes.applicationGuildCommands(process.env.client_id, process.env.discord_guild_id),
                { body: commands }
            );

            report(__line, functionName, 'Commands deployed successfully');
        } catch (err) {
            reportError(__line, functionName, `Error deploying commands:`, err);
        }
    }
}

module.exports = CommandHandler;
