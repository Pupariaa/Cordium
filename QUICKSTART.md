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

This will automatically open the configuration panel at `http://localhost:3001` if you haven't configured your bot yet.

## Step 3: Configure Discord Bot

In the web interface, go to **Initial Setup** and fill in:

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

Click **Save Discord Config**.

## Step 4: Database Configuration (Optional)

The database is **optional** but highly recommended if you want to track and analyze Discord activity over time.

### What the Database Does

Cordium can automatically record all Discord events to a MySQL/MariaDB database, including:
- All messages sent and deleted
- Message edits and reactions
- Voice channel connections and disconnections
- Voice state changes (mute, deafen, streaming, camera)
- Role changes and member updates
- Channel and emoji creation/deletion
- Bans, invites, and interactions
- Much more

This data can be queried later through custom endpoints to create statistics, logs, or analytics dashboards.

### Requirements

- **Database Type:** MySQL 5.7+ or MariaDB 10.3+
- **What You Need:**
  - A running MySQL or MariaDB server (local or remote)
  - An empty database created for Cordium
  - A database user with full permissions on that database

- **Connection Parameters:**
  - `db_host` - Database server address (e.g., `localhost`, `192.168.1.100`, `db.example.com`)
  - `db_name` - Database name (e.g., `cordium_events`)
  - `db_port` - Database port (default: `3306` for MySQL/MariaDB)
  - `db_user` - Database username with permissions
  - `db_pass` - Database password

### Configuration Steps

#### 1. Create the Database

Connect to your MySQL/MariaDB server and run:

```sql
CREATE DATABASE cordium_events CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cordium'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON cordium_events.* TO 'cordium'@'localhost';
FLUSH PRIVILEGES;
```

Replace `your_secure_password` with a strong password. If your database is on a remote server, replace `'localhost'` with `'%'` or the specific IP address.

#### 2. Configure in Web Interface

1. In the configurator web interface, fill in the **Database Configuration** section
2. Enter your connection details (host, database name, port, user, password)
3. Click **Test Connection** to verify it works
4. Click **Save** to save the configuration

**Note:** The tables will be created automatically when the bot starts. You don't need to run any SQL scripts.

#### Example Configuration

- Host: `localhost` (or your server IP)
- Database Name: `cordium_events`
- Port: `3306`
- User: `cordium`
- Password: (the password you set above)

### Without Database

If you don't configure a database:
- The bot will work perfectly fine
- Commands and events will function normally
- Messages will be cached locally in SQLite for the current session
- However, no historical data will be permanently stored
- You'll see a warning: "Database connection parameters are missing"

You can always add database configuration later without affecting existing bot functionality.

## Step 5: Create Your First Command

1. Go to **Commands** in the sidebar
2. Click **New File**
3. Name it `hello.js`
4. Paste this code:

```javascript
'use strict';

const { SlashCommandBuilder } = require('discord.js');
const path = require('path');

const cmdName = path.basename(__filename, path.extname(__filename));
const cmdDescription = 'Say hello!';

module.exports = {
    data: new SlashCommandBuilder()
        .setName(cmdName)
        .setDescription(cmdDescription),

    async execute(interaction) {
        await interaction.reply(`Hello, ${interaction.user.username}!`);
    },

    buttons: {}
};
```

5. Click **Save**

## Step 5: Launch the Bot

Once you've saved your Discord configuration, restart the application:

```bash
npm start
```

Now that the bot is configured, `npm start` will launch both:
- The Discord bot
- The configuration panel at `http://localhost:3001`

You can keep the configuration panel open to edit commands, events, and settings while the bot is running!

Your bot should now be online!

## Step 6: Test Your Command

In Discord:
1. Type `/hello`
2. The bot should respond with "Hello, [your name]!"

## Next Steps

### Enable Development Mode

For automatic hot-reload during development:

1. Go to **Configuration** in the web panel
2. Enable **Development Mode**
3. Save configuration
4. Restart the bot

Now you can edit commands and they'll reload automatically!

### Explore Events

1. Go to **Events** section
2. Browse through event categories
3. Edit event callbacks to customize behavior

Example: Edit `Message/MessageCreate.js` to respond to messages

### Create API Endpoints

1. Go to **Endpoints** section
2. Create custom REST API endpoints
3. Access them at `http://localhost:8080/private/your_endpoint`

### Use the Sandbox

1. Go to **Sandbox** section
2. Write and test code snippets
3. Access global objects like `global.client`, `global.guild`
4. Test ideas before implementing them

## Common Commands

```bash
npm start         # Launch configurator + bot (if configured)
npm run config    # Launch configurator only
npm run bot       # Launch configurator + bot (requires configuration)
npm run prod      # Production mode (no hot-reload)
```

**Note:** The configuration panel is always accessible at `http://localhost:3001` when running. You can edit files and settings while the bot is running in development mode.

## Troubleshooting

### Bot Token Invalid
- Make sure you copied the entire token
- Reset token in Discord Developer Portal if needed
- No spaces or quotes around the token

### Bot Not Responding to Commands
- Check bot has necessary permissions in your server
- Verify bot is online (green status)
- Commands may take a few seconds to register on first launch

### Configuration Panel Won't Open
- Check if port 3001 is available
- Try closing other applications using that port
- Check firewall settings

### Bot Crashes on Startup
- Verify all required credentials are set
- Check `config/config.env` file exists
- Look at error messages for missing dependencies

## Getting Help

Check the full README.md for:
- Detailed feature documentation
- API reference
- Advanced configuration options
- Prototype extensions

## Bot Permissions & Intents

### Required Intents (Discord Developer Portal > Bot)

Enable these Privileged Gateway Intents:
- **Presence Intent** - Track user online/offline status
- **Server Members Intent** - Access member join/leave events
- **Message Content Intent** - Read message contents

Without these intents, many features won't work properly.

### Recommended Permissions

The generated invite link includes Administrator permissions, but you can customize:
- Read Messages/View Channels
- Send Messages
- Use Slash Commands
- Embed Links
- Attach Files
- Read Message History
- Add Reactions
- Manage Messages
- Connect to Voice
- Speak in Voice

## What's Next?

- Explore event handlers for automatic actions
- Create custom endpoints for external integrations
- Use prototypes to extend Discord.js functionality
- Set up a database for persistent storage
- Deploy to a production server

Welcome to Cordium! Happy bot building.

