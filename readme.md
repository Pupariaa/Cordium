# Cordium

A production-ready Discord.js framework with advanced features for building scalable Discord bots. Cordium extends Discord.js 14.19 with hot-reload capabilities, structured logging, REST API endpoints, dual-mode deployment, and enhanced prototypes.

**Developed by Pupariaa in collaboration with [@lakazatong](https://github.com/lakazatong)**

## Deployment Modes

Cordium supports two operational modes to fit different needs:

### Standalone Mode
- **Database**: SQLite (local file)
- **Cache**: RAM (volatile, lost on restart)
- **Best for**: Development, testing, small servers
- **Setup**: Zero external dependencies
- **Performance**: Good

### Component Mode
- **Database**: MySQL/MariaDB (remote server)
- **Cache**: Redis (persistent)
- **Best for**: Production, large servers
- **Setup**: Requires MySQL and Redis servers
- **Performance**: Excellent

Both modes provide identical functionality - only performance and persistence differ.

## Features

### Core Systems

- **Hot-Reload Development** - Commands, events, and endpoints automatically reload on file changes during development without restarting the bot
- **Dual-Mode Architecture** - Choose between Standalone (SQLite + RAM) or Component (MySQL + Redis) deployment
- **Advanced Logging** - Structured console reporting with file context, line numbers, function names, and customizable formatting via `extend-console`
- **REST API Integration** - Built-in Express server for creating HTTP endpoints alongside Discord commands
- **Web Dashboard** - Modern web interface for configuration, monitoring, and management
- **Configuration Management** - Environment-based configuration with validation, type checking, and automatic hot-reload
- **Extended Prototypes** - Enhanced Discord.js classes with utility methods for Guild, Channel, Member, and more

### Management Systems

- **CommandsManager** - Automatic command registration, deployment, and lifecycle management with button interaction support
- **EventsManager** - Event listener registration with detailed logging and change tracking for Discord events
- **EndpointsManager** - RESTful API endpoint management with public/private routing
- **AttachmentsManager** - File upload and attachment indexing system
- **MessagesCache** - Smart message caching with Redis or RAM fallback
- **EventsDatabase** - Automatic event recording and analytics with SQLite or MySQL

### Dashboard Features

- **Server Overview** - Real-time statistics and activity graphs
- **Channel Management** - View and manage all server channels
- **Role Management** - Monitor roles and permissions
- **Member Tracking** - View all members including departed ones
- **Message Cache** - Browse cached messages with search
- **Configuration** - Live settings management
- **Modern UI** - Dark/light theme, responsive design, custom Cordium branding

### Developer Experience

- **Comprehensive Event Coverage** - Pre-structured handlers for 60+ Discord events organized by category
- **Global Path System** - Automatic path resolution for all internal modules
- **Error Handling** - Centralized error reporting with stack trace formatting
- **Graceful Shutdown** - SIGINT handler with cleanup subscriber system
- **CLI Tools** - Command-line utilities for project initialization and management
- **Setup Wizard** - Interactive configuration with mode selection and progress persistence

## Installation

```bash
npm install
```

## Quick Start

Cordium includes an interactive setup wizard that launches automatically on first run:

```bash
npm start
```

This will:
1. Launch the Setup Wizard at `http://localhost:3001`
2. Guide you through mode selection (Standalone or Component)
3. Configure Discord bot credentials
4. Set up database and cache (Component mode)
5. Create all necessary tables automatically

See [QUICKSTART.md](QUICKSTART.md) for detailed instructions.

### Available Commands

```bash
npm start          # Auto-detect: setup wizard or bot
npm run config     # Force launch configuration panel
npm run bot        # Force launch bot (if configured)
npm run prod       # Production mode
```

## Project Structure

```
Cordium/
├── config/
│   ├── cli/              # Command-line tools
│   ├── config.json       # JSON configuration
│   └── config.env        # Environment variables
├── configurator/         # Web configuration panel
│   ├── public/           # Frontend assets
│   │   ├── pages/        # HTML page templates
│   │   ├── index.html    # Main UI
│   │   ├── app.js        # Frontend logic
│   │   └── style.css     # Dashboard styling
│   └── server.js         # Configuration API server
├── internals/            # Core framework files
│   ├── prototypes/       # Discord.js class extensions
│   ├── CommandsManager.js
│   ├── EventsManager.js
│   ├── EndpointsManager.js
│   ├── EventsDatabase.js # Event recording system
│   ├── MessagesCache.js  # Message caching system
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
│   ├── sandbox/          # Code testing area
│   ├── cordium.sqlite    # SQLite database (Standalone mode)
│   └── index.js          # User entry point
├── start.js              # Entry point with auto-detection
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
        if (global.messagesCache) {
            await global.messagesCache.addMessage(message);
        }
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

### Using Extended Prototypes

Cordium extends Discord.js classes with utility methods:

```javascript
const allAuditLogs = await guild.fetchAllAuditLogs();
const latestLog = await guild.latestAuditLog();
const channelName = textChannel.nameWithParents();
const member = await textChannel.fetchMember(userId);
```

## Configuration

### Standalone Mode Configuration

```env
client_token=your_bot_token
client_id=your_client_id
discord_guild_id=your_guild_id
db_type=sqlite
db_path=./src/cordium.sqlite
```

### Component Mode Configuration

```env
client_token=your_bot_token
client_id=your_client_id
discord_guild_id=your_guild_id
db_type=mysql
db_host=localhost
db_port=3306
db_name=cordium_events
db_user=cordium
db_pass=your_password
redis_host=localhost
redis_port=6379
redis_password=
redis_db=0
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
- `global.eventsDatabase` - Events database (SQLite or MySQL)
- `global.messagesCache` - Messages cache (RAM or Redis)
- Path helpers: `global.commandsFolder`, `global.eventsFolder`, etc.

### Database System

**EventsDatabase** automatically records all Discord activity:
- Messages (create, update, delete)
- Members (join, leave, update)
- Roles (create, update, delete)
- Voice states (join, leave, mute, deafen)
- Reactions, invites, emojis, and more

All tables are created automatically on first run. Works identically with SQLite or MySQL.

### Message Caching

**MessagesCache** provides fast access to recent messages:

**Component Mode (Redis)**:
- Unlimited storage capacity
- Persistent across restarts
- Fast queries and searches
- Priority message system

**Standalone Mode (RAM)**:
- Up to 10,000 messages in memory
- Lost on bot restart
- Automatic reload from Discord on startup
- Same API as Redis mode

## Version Compatibility

Currently compatible with **Discord.js 14.19.1**.

Support for Discord.js 14.22 with its new features is planned for a future release.

## Dependencies

- `discord.js` ^14.19.1 - Discord API wrapper
- `sequelize` ^6.37.7 - ORM for database management
- `sqlite3` ^5.1.7 - SQLite database driver
- `mysql2` ^3.15.2 - MySQL database driver
- `redis` ^4.7.1 - Redis client
- `express` ^5.1.0 - HTTP server framework
- `extend-console` ^7.4.7 - Advanced console logging
- `chokidar` ^4.0.3 - File system watcher
- `sanitize-filename` ^1.6.3 - Safe filename handling
- `spectraget` ^1.1.0 - HTTP request library

## License

MIT

## Contributors

- **Pupariaa** - Core development
- **[@lakazatong](https://github.com/lakazatong)** - Collaboration and tooling
