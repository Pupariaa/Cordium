# Cordium

A production-ready Discord.js framework with advanced features for building scalable Discord bots. Cordium extends Discord.js 14.19 with hot-reload capabilities, structured logging, REST API endpoints, and enhanced prototypes.

**Developed by Pupariaa in collaboration with [@lakazatong](https://github.com/lakazatong)**

## Features

### Core Systems

- **Hot-Reload Development** - Commands, events, and endpoints automatically reload on file changes during development without restarting the bot
- **Advanced Logging** - Structured console reporting with file context, line numbers, function names, and customizable formatting via `extend-console`
- **REST API Integration** - Built-in Express server for creating HTTP endpoints alongside Discord commands
- **Configuration Management** - Environment-based configuration with validation, type checking, and automatic hot-reload
- **Extended Prototypes** - Enhanced Discord.js classes with utility methods for Guild, Channel, Member, and more

### Management Systems

- **CommandsManager** - Automatic command registration, deployment, and lifecycle management with button interaction support
- **EventsManager** - Event listener registration with detailed logging and change tracking for Discord events
- **EndpointsManager** - RESTful API endpoint management with public/private routing
- **AttachmentsManager** - File upload and attachment indexing system
- **ConfigManager** - Dynamic configuration loading with type validation and watch mode

### Developer Experience

- **Comprehensive Event Coverage** - Pre-structured handlers for 60+ Discord events organized by category
- **Global Path System** - Automatic path resolution for all internal modules
- **Error Handling** - Centralized error reporting with stack trace formatting
- **Graceful Shutdown** - SIGINT handler with cleanup subscriber system
- **CLI Tools** - Command-line utilities for project initialization and management

## Installation

```bash
npm install
```

Configure your bot credentials in `config/config.env`:

```env
client_token=your_bot_token_here
client_id=your_client_id_here
discord_guild_id=your_guild_id_here
```

Run the bot:

```bash
node index.js
```

For production mode:

```bash
npm run prod
```

## Project Structure

```
Cordium/
├── config/
│   ├── cli/              # Command-line tools
│   ├── config.json       # JSON configuration
│   └── config.env        # Environment variables
├── internals/            # Core framework files
│   ├── prototypes/       # Discord.js class extensions
│   ├── CommandsManager.js
│   ├── EventsManager.js
│   ├── EndpointsManager.js
│   ├── ConfigManager.js
│   ├── FilesManager.js
│   └── Utils.js
├── src/
│   ├── commands/         # Slash commands
│   ├── events/           # Discord event handlers
│   │   ├── AutoModeration/
│   │   ├── Channel/
│   │   ├── Guild/
│   │   ├── Message/
│   │   ├── Thread/
│   │   └── ...
│   ├── endpoints/        # API endpoints
│   │   ├── public/       # Publicly accessible
│   │   └── private/      # Authentication required
│   ├── config/           # User configuration
│   └── index.js          # User entry point
└── index.js              # Framework entry point
```

## Usage

### Creating Commands

Commands are automatically loaded from `src/commands/`. Each command exports a Discord.js SlashCommandBuilder and an execute function:

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('example')
        .setDescription('Example command'),
    
    async execute(interaction) {
        await interaction.reply('Hello from Cordium!');
    },
    
    buttons: {}
};
```

### Handling Events

Events are organized by category in `src/events/`. Set `listen: true` to enable an event handler:

```javascript
module.exports = {
    listen: true,
    report: true,
    callback: async function (message) {
    }
};
```

The framework provides automatic logging for all event changes with before/after comparisons.

### Creating API Endpoints

Endpoints support GET and POST methods with automatic routing:

```javascript
module.exports = {
    type: 'private',
    name: 'get_data',
    method: 'GET',
    callback: async function (req, res) {
        const result = await someAsyncOperation();
        res.json({ success: true, data: result });
    }
};
```

Access endpoints at `http://localhost:8080/private/get_data` or `http://localhost:8080/public/endpoint_name`.

### Configuration Management

Create custom configuration schemas with type validation:

```javascript
const myConfig = {
    api_key: { 
        required: true, 
        type: 'string' 
    },
    max_retries: { 
        required: false, 
        type: 'number', 
        defaultValue: 3 
    }
};

class MyConfigManager extends ConfigManager {
    constructor() {
        super(path.join(global.projectRoot, 'src/config/config.env'), myConfig);
    }
}
```

Values are automatically loaded to `global.apiKey` and `global.maxRetries` using camelCase transformation.

### Using Extended Prototypes

Cordium extends Discord.js classes with utility methods:

```javascript
const allAuditLogs = await guild.fetchAllAuditLogs();
const latestLog = await guild.latestAuditLog();
const channelName = textChannel.nameWithParents();
const member = await textChannel.fetchMember(userId);
```

## Technical Details

### Logging System

The framework uses `extend-console` for structured logging with three report levels:

- `console.report()` - Info level logs with cyan highlighting
- `console.reportWarn()` - Warning level logs with yellow highlighting
- `console.reportError()` - Error level logs with red highlighting and stack traces

All logs include timestamp, file location, line number, and function context.

### Hot-Reload Mechanism

In development mode, the framework watches for file changes and:
1. Unloads the module from Node.js require cache
2. Reloads the file and validates its structure
3. Re-registers commands/events/endpoints
4. Logs the reload operation

This enables rapid development without bot restarts.

### Global Context

The framework establishes a global context accessible throughout your code:

- `global.client` - Discord.js Client instance
- `global.guild` - Main guild object
- `global.channels` - Channel management system
- `global.commandsManager` - Command system
- `global.eventsManager` - Event system
- `global.endpointsManager` - API system
- Path helpers: `global.commandsFolder`, `global.eventsFolder`, etc.

## Version Compatibility

Currently compatible with **Discord.js 14.19.1**.

Support for Discord.js 14.22 with its new features is planned for a future release.

## Development

Initialize a new development environment:

```bash
npm run init
```

This creates necessary configuration files and folder structure.

## License

MIT

## Contributors

- **Pupariaa** - Core development
- **[@lakazatong](https://github.com/lakazatong)** - Collaboration and tooling

## Dependencies

- `discord.js` ^14.19.1 - Discord API wrapper
- `extend-console` ^7.4.7 - Advanced console logging
- `express` ^5.1.0 - HTTP server framework
- `chokidar` ^4.0.3 - File system watcher
- `sanitize-filename` ^1.6.3 - Safe filename handling
- `spectraget` ^1.1.0 - HTTP request library
