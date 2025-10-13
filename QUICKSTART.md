# Cordium Quick Start Guide

Get your Discord bot running in 5 minutes.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Launch Cordium

```bash
npm start
```

This will automatically open the Setup Wizard at `http://localhost:3001`.

## Step 3: Choose Your Deployment Mode

The wizard will present two options:

### Standalone Mode
- **Best for**: Testing, development, small servers
- **Database**: SQLite (local file)
- **Cache**: RAM (lost on restart)
- **Setup Time**: 2 minutes
- **External Dependencies**: None

Choose this if you want the simplest setup with no infrastructure requirements.

### Component Mode
- **Best for**: Production, large servers
- **Database**: MySQL/MariaDB (remote server)
- **Cache**: Redis (persistent)
- **Setup Time**: 5 minutes
- **External Dependencies**: MySQL server, Redis server

Choose this for better performance and data persistence.

## Step 4: Configure Discord Bot

Enter your Discord bot credentials:

1. **Bot Token** - Get from [Discord Developer Portal](https://discord.com/developers/applications)
   - Create an application
   - Go to "Bot" section
   - **Enable Privileged Gateway Intents:**
     - Presence Intent
     - Server Members Intent
     - Message Content Intent
   - Click "Reset Token" and copy it

2. **Client ID** - Found in "General Information" section of your application

3. **Guild ID** - Enable Developer Mode in Discord settings
   - Right-click your server
   - Click "Copy Server ID"

4. Use the generated **Invite Link** to add your bot to your server

Click **Continue**.

## Step 5A: Standalone Mode (Skip to 6 if Component)

If you chose Standalone mode, you're done! The wizard will:
- Automatically configure SQLite database
- Set up RAM caching
- Skip to completion screen

Jump to **Step 6**.

## Step 5B: Component Mode Infrastructure

If you chose Component mode, configure your infrastructure:

### MySQL Database

Fill in your MySQL/MariaDB connection details:
- **Host**: Database server address (e.g., `localhost`, `10.0.0.33`)
- **Database Name**: Name for your Cordium database (e.g., `cordium_events`)
- **Port**: Usually `3306` for MySQL
- **User**: Database username with full permissions
- **Password**: Database password

Click **Test Connection** to verify.

Then click **Create Database & Tables** to automatically:
- Create the database if it doesn't exist
- Create all 40+ event tables
- Verify table creation

### Redis Cache

Fill in your Redis connection details:
- **Host**: Redis server address (e.g., `localhost`, `10.0.0.34`)
- **Port**: Usually `6379`
- **Password**: Optional, leave empty if none
- **Database Number**: Usually `0` or `1`

Click **Test Connection** to verify.

Click **Complete Setup** when done.

## Step 6: Launch the Bot

The wizard is complete! Restart the application:

```bash
npm start
```

Now that configuration is complete, the bot will:
- Connect to Discord
- Initialize the selected database (SQLite or MySQL)
- Set up message caching (RAM or Redis)
- Load all commands and events
- Start the dashboard at `http://localhost:3001`

Your bot should now be online!

## Step 7: Explore the Dashboard

Open `http://localhost:3001` in your browser to access:

### Server Overview
- Real-time CPU, RAM, and uptime stats
- Activity graphs (messages, members, hourly activity)
- Channel distribution charts

### Channels
- View all text, voice, and forum channels
- See member counts and activity
- Manage channel settings

### Roles
- View all server roles
- See member counts per role
- Monitor role hierarchy

### Members
- View all members (including departed)
- See online status and roles
- View detailed member profiles
- Track member activity history

### Messages
- Browse cached messages
- Search message history
- View message details

### Configuration
- View current deployment mode
- Manage Discord bot settings
- Configure database and cache
- Test connections
- Restart setup wizard if needed

## Common Commands

```bash
npm start         # Launch bot + dashboard
npm run config    # Launch dashboard only
npm run bot       # Launch bot + dashboard (force)
npm run prod      # Production mode (no hot-reload)
```

## Creating Your First Command

1. Open the dashboard at `http://localhost:3001`
2. Go to **Commands** (or edit files directly in `src/commands/`)
3. Create `hello.js`:

```javascript
'use strict';

const { SlashCommandBuilder } = require('discord.js');
const path = require('path');

const cmdName = path.basename(__filename, path.extname(__filename));

module.exports = {
    data: new SlashCommandBuilder()
        .setName(cmdName)
        .setDescription('Say hello!'),

    async execute(interaction) {
        await interaction.reply(`Hello, ${interaction.user.username}!`);
    },

    buttons: {}
};
```

4. Save the file
5. In Discord, type `/hello`
6. The bot responds with "Hello, [your name]!"

## Switching Modes

You can change deployment modes anytime:

1. Open the dashboard configuration page
2. Click **Run Setup Wizard** in the Danger Zone
3. Select a different mode
4. Complete the wizard
5. Restart the bot

**Note**: When switching from Component to Standalone, historical data in MySQL is not migrated.

## Troubleshooting

### Bot Not Creating SQLite File (Standalone Mode)
- Check console logs for "Using SQLite database at: ..."
- Verify `db_type=sqlite` in `config/config.env`
- Ensure bot has write permissions in the `src/` folder
- Check for errors during EventsDatabase initialization

### Database Connection Failed (Component Mode)
- Verify MySQL server is running
- Check host, port, username, and password
- Ensure database user has CREATE and ALTER permissions
- Use "Test Connection" button in the wizard

### Redis Connection Failed (Component Mode)
- Verify Redis server is running
- Check host and port
- Test with `redis-cli` if available
- Use "Test Connection" button in the wizard

### Messages Not Caching
- **Standalone**: Check RAM cache is initializing
- **Component**: Verify Redis connection
- Check console for MessagesCache errors
- Ensure bot has Message Content intent enabled

### Bot Token Invalid
- Copy the entire token without spaces
- Reset token in Discord Developer Portal if needed
- Don't include quotes around the token in config.env

### Bot Not Responding to Commands
- Check bot has necessary permissions in your server
- Verify bot is online (check dashboard or Discord)
- Commands may take a few seconds to register on first launch
- Ensure all three privileged intents are enabled

### Configuration Panel Won't Open
- Check if port 3001 is available
- Try closing other applications using that port
- Check firewall settings
- Look for "Cordium Configuration Panel" message in terminal

### Tables Not Created
- Check console logs for sync errors
- Verify database user has CREATE TABLE permissions
- Look for "Tables synchronized: X successful" message
- In Component mode, use "Create Database & Tables" button

## Required Discord Intents

Enable these in Discord Developer Portal > Bot:
- **Presence Intent** - Track user online/offline status
- **Server Members Intent** - Access member join/leave events
- **Message Content Intent** - Read message contents

Without these intents, many features won't work properly.

## What's Next?

### Enable Development Mode
- Automatically reload commands on file changes
- Hot-reload events and endpoints
- Faster development iteration

### Explore Events
- Browse 60+ pre-structured event handlers
- Customize Discord event responses
- Track specific activities

### Create API Endpoints
- Build custom REST APIs
- Integrate with external services
- Create webhooks and automation

### Use the Sandbox
- Test code snippets safely
- Access global objects
- Prototype features before implementing

### Set Up Analytics
- View real-time activity graphs
- Track message patterns
- Monitor member activity
- Analyze channel usage

## Performance Tips

### Standalone Mode
- Limit to servers with <100 active members
- Restart periodically to clear RAM cache
- Message history limited to 10,000 messages
- Perfect for development and testing

### Component Mode
- Recommended for servers >100 active members
- No message history limits
- Cache persists across restarts
- Better query performance
- Production-ready

## Migration

### Standalone → Component
1. Set up MySQL and Redis servers
2. Run the setup wizard
3. Choose Component mode
4. Complete configuration
5. Restart bot
6. Message cache rebuilds automatically

### Component → Standalone
1. Run the setup wizard
2. Choose Standalone mode
3. Restart bot
4. Historical MySQL data remains but won't be used

## Getting Help

- Check full feature documentation in this README
- Review event handler examples in `src/events/`
- Inspect endpoint implementations in `src/endpoints/`
- Use the dashboard sandbox for testing

Welcome to Cordium! Happy bot building.
