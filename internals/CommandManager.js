const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { Collection } = require('discord.js');

const { __cfn, __cf } = eval(require(`current_filename`));
const { report, reportWarn, reportError } = console.createReports(__cfn);

class CommandHandler {
    constructor() {
        this.rest = new REST({ version: '10' }).setToken(global.clientToken);
        if (!global.client.commands) global.client.commands = new Collection();
    }

    /**
     * Loads commands from the 'handlers' directory and registers them with the client.
     */
    loadCommands() {
        const functionName = 'loadCommands';
        try {
            report(__line, functionName, 'Loading commands...');

            // Read command files from the handlers directory
            const commandFiles = fs.readdirSync(global.commandsFolder);
            for (const file of commandFiles) {
                try {
                    const command = require(path.join(global.commandsFolder, file));
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
            await this.rest.put(
                Routes.applicationGuildCommands(global.clientId, global.discordGuildId),
                { body: commands }
            );

            report(__line, functionName, 'Commands deployed successfully');
        } catch (err) {
            reportError(__line, functionName, `Error deploying commands:`, err);
        }
    }
}

module.exports = CommandHandler;
