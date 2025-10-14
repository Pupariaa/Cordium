# Cordium Global API Documentation

This comprehensive documentation covers all global objects, prototypes, utilities, and functions available in the Cordium Discord bot framework.

## Global Objects Overview

Cordium automatically initializes several global objects and utilities during startup:

### Core Discord Objects
- `global.client` - Discord.js Client instance
- `global.guild` - Current guild instance
- `global.channels` - Channel management system
- `global.commandsManager` - Slash commands manager
- `global.eventsManager` - Event handlers manager
- `global.endpointsManager` - API endpoints manager

### Cache & Storage
- `global.cache` - Dual-mode cache (RAM + Redis)
- `global.messagesCache` - Message caching system
- `global.redisManager` - Redis connection manager
- `global.eventsDatabase` - Event recording database
- `global.attachmentsManager` - File attachment handler

### Configuration & Utilities
- `global.defaultConfigManager` - Configuration management
- `global.projectRoot` - Project root directory
- `global.utilsPath` - Path to utilities module

## Prototypes System

### Loading System
Prototypes are loaded from two locations:
- `internals/prototypes/` - Core prototypes (always loaded)
- `src/prototypes/` - User-defined prototypes (configurable via `prototypes_folder` setting)

All `.js` files in these directories are automatically required during bot initialization.

## Array Prototypes

### `Array.prototype.remove(element)`
Removes the first occurrence of an element from the array.

```javascript
const users = ['alice', 'bob', 'charlie'];
const removed = users.remove('bob'); // Returns true
console.log(users); // ['alice', 'charlie']

const notFound = users.remove('david'); // Returns false
console.log(users); // ['alice', 'charlie'] (unchanged)
```

## String Prototypes

### `String.prototype.trueLength()`
Returns the actual visible length excluding ANSI color codes.

```javascript
const coloredText = '\x1b[31mHello\x1b[0m World';
console.log(coloredText.length); // 18 (includes escape codes)
console.log(coloredText.trueLength()); // 11 (actual visible text)

// Useful for Discord message length validation
const message = '\x1b[32mSuccess!\x1b[0m';
if (message.trueLength() > 2000) {
    console.log('Message too long for Discord');
}
```

### `String.prototype.abbreviate(maxLength, mustEndWith)`
Abbreviates text while preserving color codes and optional suffix.

```javascript
const longText = "This is a very long message that needs shortening";
const short1 = longText.abbreviate(20); // "This is a very lo..."
const short2 = longText.abbreviate(20, "!"); // "This is a very l...!"

// With color codes
const coloredLong = '\x1b[31m' + longText + '\x1b[0m';
const coloredShort = coloredLong.abbreviate(25); // Preserves colors
```

## Discord.js Client Prototypes

### `Client.prototype.getChannelByName(channelName)`
Finds a channel by its exact name in the current guild.

```javascript
const generalChannel = client.getChannelByName('general');
if (generalChannel) {
    console.log(`Found channel: ${generalChannel.name}`);
} else {
    console.log('Channel not found');
}
```

### `Client.prototype.getChannelById(channelId)`
Finds a channel by ID with automatic padding for shorter IDs.

```javascript
// Works with full IDs
const channel1 = client.getChannelById('1234567890123456789');

// Works with shorter IDs (auto-padded)
const channel2 = client.getChannelById('123456789012345678'); // Auto-padded to 19 digits
```

### `Client.prototype.findChannel(channelRep)`
Universal channel finder accepting either name or ID.

```javascript
// By name
const channelByName = client.findChannel('announcements');

// By ID
const channelById = client.findChannel('1234567890123456789');

// Dynamic usage
const channelRep = someVariable; // Could be either string or ID
const channel = client.findChannel(channelRep);
```

### `Client.prototype.sendMessageToChannel(channelName, message)`
Sends a message to a channel by name with error handling.

```javascript
try {
    await client.sendMessageToChannel('general', 'Hello everyone!');
    console.log('Message sent successfully');
} catch (error) {
    console.log('Failed to send message:', error.message);
}
```

### `Client.prototype.broadcastMessage(message)`
Sends a message to the first available text channel with permissions.

```javascript
// Useful for system announcements
await client.broadcastMessage('Bot is restarting for maintenance...');
```

### `Client.prototype.getUserByUsername(username)`
Finds a user by their Discord username.

```javascript
const user = await client.getUserByUsername('john_doe');
if (user) {
    console.log(`Found user: ${user.username}#${user.discriminator}`);
} else {
    console.log('User not found');
}
```

### `Client.prototype.getMemberById(id)`
Gets a guild member by their user ID.

```javascript
const memberId = '1234567890123456789';
const member = client.getMemberById(memberId);
if (member) {
    console.log(`Member: ${member.user.username}`);
    console.log(`Joined: ${member.joinedAt}`);
} else {
    console.log('Member not found');
}
```

### `Client.prototype.rateLimitCheck()`
Sets up automatic rate limit monitoring and logging.

```javascript
// Call this once during bot initialization
client.rateLimitCheck();

// Now rate limits will be automatically logged:
// "Rate limit hit! Timeout: 5000, Limit: 5, Method: POST, Path: /channels/123/messages"
```

### `Client.prototype.getMemberCount(includeBots)`
Gets current member count with optional bot filtering.

```javascript
const totalMembers = client.getMemberCount(true); // Includes bots
const humanMembers = client.getMemberCount(false); // Excludes bots
const defaultMembers = client.getMemberCount(); // Excludes bots (default)

console.log(`Total: ${totalMembers}, Humans: ${humanMembers}`);
```

## Guild Prototypes

### `Guild.prototype.fetchAllAuditLogs()`
Fetches all available audit logs from the guild.

```javascript
try {
    const auditLogs = await guild.fetchAllAuditLogs();
    console.log(`Fetched ${auditLogs.length} audit log entries`);
    
    // Find specific actions
    const channelCreations = auditLogs.filter(log => 
        log.action === 'CHANNEL_CREATE'
    );
    
    // Get recent activity
    const recentLogs = auditLogs.slice(0, 10);
    recentLogs.forEach(log => {
        console.log(`${log.action} by ${log.executor?.username} at ${log.createdAt}`);
    });
} catch (error) {
    console.error('Failed to fetch audit logs:', error);
}
```

### `Guild.prototype.latestAuditLog()`
Gets the most recent audit log entry.

```javascript
const latestLog = await guild.latestAuditLog();
if (latestLog) {
    console.log(`Latest action: ${latestLog.action}`);
    console.log(`Executor: ${latestLog.executor?.username}`);
    console.log(`Target: ${latestLog.target?.username || latestLog.target?.name}`);
    console.log(`Time: ${latestLog.createdAt}`);
} else {
    console.log('No audit logs found');
}
```

### `Guild.prototype.channelTypeStr(channelType)`
Converts numeric channel types to readable strings.

```javascript
// Get all channels with their types
guild.channels.cache.forEach(channel => {
    const typeStr = guild.channelTypeStr(channel.type);
    console.log(`${channel.name}: ${typeStr}`);
});

// Supported types:
// 0 → "text"
// 2 → "voice" 
// 15 → "forum"
// Others → "who cares"
```

## GuildMember Prototypes

### `GuildMember.prototype.hasRole(roleName)`
Checks if the member has a specific role by name.

```javascript
// Check if member has moderator role
if (member.hasRole('Moderator')) {
    console.log(`${member.user.username} is a moderator`);
}

// Check multiple roles
const roles = ['Admin', 'Moderator', 'VIP'];
const hasAnyRole = roles.some(role => member.hasRole(role));
if (hasAnyRole) {
    console.log(`${member.user.username} has special privileges`);
}
```

### `GuildMember.prototype.isBot()`
Checks if the member is a bot account.

```javascript
// Filter out bots from member lists
const humanMembers = guild.members.cache.filter(member => !member.isBot());
console.log(`Human members: ${humanMembers.size}`);

// Handle bot members differently
if (member.isBot()) {
    console.log(`Bot detected: ${member.user.username}`);
} else {
    console.log(`Human user: ${member.user.username}`);
}
```

## Channel Prototypes

### BaseChannel

#### `BaseChannel.prototype.getMembers()`
Gets all members currently in the channel.

```javascript
// Get members in a voice channel
const voiceChannel = guild.channels.cache.find(c => c.type === 2);
if (voiceChannel) {
    const members = await voiceChannel.getMembers();
    console.log(`Members in ${voiceChannel.name}: ${members.length}`);
    members.forEach(member => {
        console.log(`- ${member.user.username}`);
    });
}
```

### TextChannel

#### `TextChannel.prototype.fetchAllMessages(...args)`
Fetches all messages from the channel using advanced options.

```javascript
// Fetch all messages (newest first)
const allMessages = await textChannel.fetchAllMessages();

// Fetch with custom sorting (oldest first)
const oldFirst = await textChannel.fetchAllMessages(
    global.channels.fetchAllMessages.sortDown
);

// Fetch with custom processing
const processedMessages = await textChannel.fetchAllMessages(
    global.channels.fetchAllMessages.sortUp,
    (message, result) => {
        if (message.content.includes('important')) {
            result.unshift(message);
        }
    }
);
```

#### `TextChannel.prototype.hasTag(tag)`
Checks if the text channel has a specific tag.

```javascript
// Check if channel has specific tags
if (textChannel.hasTag('announcements')) {
    console.log('This is an announcement channel');
}

if (textChannel.hasTag('moderator-only')) {
    console.log('This channel is for moderators only');
}
```

#### `TextChannel.prototype.getMessageById(id)`
Gets a message by ID from the channel's cache.

```javascript
const messageId = '1234567890123456789';
const message = textChannel.getMessageById(messageId);
if (message) {
    console.log(`Found message: ${message.content}`);
    console.log(`Author: ${message.author.username}`);
} else {
    console.log('Message not found in cache');
}
```

### ThreadChannel & VoiceChannel

Both have similar methods to TextChannel:

```javascript
// Thread channels
const threadMessages = await threadChannel.fetchAllMessages();
const hasThreadTag = threadChannel.hasTag('support');

// Voice channels  
const voiceMessages = await voiceChannel.fetchAllMessages();
const hasVoiceTag = voiceChannel.hasTag('music');
```

## Global Utilities

### Console Reporting Functions

Cordium extends the console with structured reporting:

```javascript
// Info level logging (cyan highlighting)
console.report('Bot started successfully');
console.report('Processing', 'userCount', 150);

// Warning level logging (yellow highlighting)
console.reportWarn('Rate limit approaching');
console.reportWarn('Channel not found', 'channelName', 'general');

// Error level logging (red highlighting)
console.reportError('Database connection failed');
console.reportError('API Error', 'status', 500, 'message', 'Internal Server Error');
```

### Utility Functions (from Utils.js)

#### `wait(ms)`
Creates a promise that resolves after specified milliseconds.

```javascript
// Wait 2 seconds
await wait(2000);

// In loops
for (let i = 0; i < 5; i++) {
    console.log(`Step ${i + 1}`);
    await wait(1000); // Wait 1 second between steps
}
```

#### `set(object, key, value, writable, enumerable, configurable)`
Defines object properties with specific descriptors.

```javascript
const config = {};
set(config, 'apiKey', 'secret123', false, false, false); // Read-only, non-enumerable
set(config, 'debug', true, true, true, true); // Fully configurable

console.log(config.apiKey); // 'secret123'
console.log(Object.keys(config)); // ['debug'] (apiKey not enumerable)
```

#### `getSet(chain, defaultWritable, defaultEnumerable, defaultConfigurable)`
Returns a function for chained property setting.

```javascript
const setter = getSet(true); // Chainable setter
const obj = {};

obj.setter('name', 'John')
   .setter('age', 25)
   .setter('city', 'New York');

console.log(obj); // { name: 'John', age: 25, city: 'New York' }
```

#### `downloadFile(url, filePath)`
Downloads a file from URL to local path.

```javascript
try {
    const localPath = await downloadFile(
        'https://example.com/image.jpg',
        './downloads/image.jpg'
    );
    console.log(`Downloaded to: ${localPath}`);
} catch (error) {
    console.error('Download failed:', error);
}
```

#### `getOtherwise(obj, path, defaultValue)`
Safely gets nested object properties.

```javascript
const user = {
    profile: {
        settings: {
            theme: 'dark'
        }
    }
};

// Safe property access
const theme = getOtherwise(user, 'profile.settings.theme', 'light');
const language = getOtherwise(user, 'profile.settings.language', 'en');

// With array path
const theme2 = getOtherwise(user, ['profile', 'settings', 'theme'], 'light');
```

#### `getOrNull(obj, path)`
Gets nested properties, returns null if not found.

```javascript
const config = getOrNull(global, 'defaultConfigManager.settings');
if (config) {
    console.log('Config found:', config);
} else {
    console.log('Config not found');
}
```

#### `capitalize(word)` & `decapitalize(word)`
String case manipulation.

```javascript
const capitalized = capitalize('hello'); // 'Hello'
const decapitalized = decapitalize('Hello'); // 'hello'

// Useful for formatting
const channelName = 'general';
const displayName = capitalize(channelName); // 'General'
```

#### `toCamelCase(varname)`
Converts snake_case to camelCase.

```javascript
const camelCase = toCamelCase('user_name'); // 'userName'
const camelCase2 = toCamelCase('API_KEY'); // 'apiKey'

// Useful for dynamic property names
const propertyName = toCamelCase('discord_guild_id') + 'Path';
// Results in: 'discordGuildIdPath'
```

#### `compareObjects(obj1, obj2, path, seen)`
Deep compares two objects and returns differences.

```javascript
const oldConfig = { api: { key: 'old', timeout: 5000 } };
const newConfig = { api: { key: 'new', timeout: 3000 } };

const differences = compareObjects(oldConfig, newConfig);
console.log(differences); // ['api.key', 'api.timeout']

// With custom path
const apiDifferences = compareObjects(oldConfig.api, newConfig.api, 'api');
console.log(apiDifferences); // ['api.key', 'api.timeout']
```

#### Directory Walking Functions

```javascript
// Synchronous directory walking
walkDirSync('./src', (filePath, stats) => {
    if (stats.isFile() && filePath.endsWith('.js')) {
        console.log(`Found JS file: ${filePath}`);
    }
});

// Asynchronous directory walking
await walkDir('./src', async (filePath, stats) => {
    if (stats.isFile()) {
        const content = await fs.readFile(filePath, 'utf8');
        console.log(`Processing: ${filePath}`);
    }
});

// Parallel async directory walking
await walkDirAsync('./src', async (filePath, stats) => {
    // All files processed in parallel
    return processFile(filePath, stats);
});
```

#### `waitForFile(filePath, timeout, interval)`
Waits for a file to exist.

```javascript
// Wait for config file to be created
const exists = await waitForFile('./config.json', 10000, 500);
if (exists) {
    console.log('Config file found');
} else {
    console.log('Config file not found within timeout');
}
```

#### `abstractClassBuilder(className, construct, attributes, methods)`
Creates abstract classes with defined attributes and methods.

```javascript
const AbstractChannel = abstractClassBuilder(
    'AbstractChannel',
    function(name) { this.name = name; },
    [
        { name: 'name', defaultValue: '', setter: null, getter: null },
        { name: 'type', defaultValue: 'text', setter: null, getter: null }
    ],
    [
        { name: 'send', mandatory: true },
        { name: 'delete', mandatory: true }
    ]
);

class TextChannel extends AbstractChannel {
    send(message) {
        console.log(`Sending to ${this.name}: ${message}`);
    }
    
    delete() {
        console.log(`Deleting channel: ${this.name}`);
    }
}
```

## Global Channel Management

### `global.channels` Object

The channels object provides advanced channel management with aliases and tags.

```javascript
// Get channel by alias
const generalChannel = global.channels.text.getByAlias('general');
const musicChannel = global.channels.voice.getByAlias('music');

// Get channels by tags
const announcementChannels = global.channels.text.getByTags('announcements');
const moderatorChannels = global.channels.getByTags('moderator-only');

// Iterate through channels
global.channels.text.each(channel => {
    console.log(`Text channel: ${channel.name}`);
});

// Get channel by ID
const channelById = global.channels.getById('1234567890123456789');
```

### Advanced Message Fetching

```javascript
// Fetch all messages with custom sorting
const messages = await global.channels.fetchAllMessages.call(
    textChannel,
    global.channels.fetchAllMessages.sortUp, // Sort newest to oldest
    (message, result) => {
        // Custom processing for each message
        if (message.content.includes('important')) {
            result.unshift(message);
        }
    },
    (lastId) => ({ before: lastId }), // Fetch options
    null, // Default last ID
    [] // Default result array
);

// Different sorting options
const newestFirst = global.channels.fetchAllMessages.sortUp;
const oldestFirst = global.channels.fetchAllMessages.sortDown;
const scanNewest = global.channels.fetchAllMessages.scanUp;
const scanOldest = global.channels.fetchAllMessages.scanDown;
```

## Global Cache System

### `global.cache` Object

Dual-mode caching (RAM + Redis) with automatic fallback.

```javascript
// Set cache with TTL
await global.cache.set('user:123', { name: 'John', level: 5 }, 3600); // 1 hour TTL

// Get from cache
const user = await global.cache.get('user:123');
if (user) {
    console.log(`Cached user: ${user.name}`);
} else {
    console.log('User not in cache');
}

// Check if key exists
const exists = await global.cache.exists('user:123');

// Delete from cache
await global.cache.del('user:123');

// Get cache statistics
const stats = global.cache.getStats();
console.log(`Hit rate: ${stats.hitRate}`);
console.log(`Memory size: ${stats.memorySize}`);
console.log(`Redis enabled: ${stats.redisEnabled}`);

// Flush all cache
await global.cache.flush();
```

## Global Messages Cache

### `global.messagesCache` Object

Advanced message caching with Redis/RAM dual mode.

```javascript
// Add message to cache
const success = await global.messagesCache.addMessage(message);
if (success) {
    console.log('Message cached successfully');
}

// Get messages with pagination
const result = await global.messagesCache.getMessages(50, 0); // 50 messages, starting from 0
console.log(`Retrieved ${result.messages.length} messages`);
console.log(`Has more: ${result.hasMore}`);
console.log(`Next offset: ${result.offset}`);

// Update message in cache
await global.messagesCache.updateMessage(editedMessage);

// Delete message from cache
await global.messagesCache.deleteMessage(messageId);

// Get cache statistics
const stats = await global.messagesCache.getStats();
console.log(`Total messages: ${stats.totalMessages}`);
console.log(`Oldest: ${stats.oldest?.timestamp}`);
console.log(`Newest: ${stats.newest?.timestamp}`);

// Get channel statistics
const channelStats = await global.messagesCache.getChannelStats();
channelStats.forEach(channel => {
    console.log(`${channel.channelName}: ${channel.count} messages`);
});

// Add message edit history
await global.messagesCache.addMessageEdit(
    messageId,
    'Old content',
    'New content',
    Date.now()
);

// Add reaction event
await global.messagesCache.addReactionEvent(
    messageId,
    userId,
    username,
    '👍',
    null, // emojiId for custom emojis
    'add',
    Date.now()
);

// Get message history (edits, reactions, replies)
const history = await global.messagesCache.getMessageHistory(messageId);
console.log(`Edits: ${history.edits.length}`);
console.log(`Reactions: ${history.reactions.length}`);
console.log(`Replies: ${history.replies.length}`);

// Set message priority
await global.messagesCache.setPriority(messageId, true);

// Check if message is priority
const isPriority = await global.messagesCache.isPriority(messageId);
```

## Global Managers

### `global.commandsManager`

```javascript
// Access loaded commands
for (const [name, command] of global.commandsManager.loaded) {
    console.log(`Command: ${name} - ${command.data.description}`);
}

// Check if command exists
if (global.commandsManager.loaded.has('ping')) {
    console.log('Ping command is loaded');
}
```

### `global.eventsManager`

```javascript
// Access loaded events
for (const [eventName, eventHandler] of global.eventsManager.loaded) {
    console.log(`Event: ${eventName} - Listening: ${eventHandler.listen}`);
}
```

### `global.endpointsManager`

```javascript
// Access loaded endpoints
for (const [endpointName, endpoint] of global.endpointsManager.loaded) {
    console.log(`Endpoint: ${endpointName} - Type: ${endpoint.type}`);
}
```

## Configuration Management

### `global.defaultConfigManager`

```javascript
// Access configuration values
const apiPort = global.defaultConfigManager.get('api_port');
const devMode = global.defaultConfigManager.get('dev');
const guildId = global.defaultConfigManager.get('discord_guild_id');

// Check if configuration is valid
if (global.defaultConfigManager.isValid()) {
    console.log('Configuration is valid');
} else {
    console.log('Configuration has errors');
}
```

## Complete Usage Examples

### Example 1: Message Processing Bot

```javascript
// In an event handler
module.exports = {
    listen: true,
    report: true,
    callback: async function (message) {
        // Add to cache
        await global.messagesCache.addMessage(message);
        
        // Check if user has role
        if (message.member.hasRole('Moderator')) {
            console.log('Moderator message detected');
        }
        
        // Process attachments
        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            console.log(`Attachment: ${attachment.name}`);
        }
        
        // Send to specific channel
        if (message.content.includes('@admin')) {
            await global.client.sendMessageToChannel('admin-alerts', 
                `Admin mention from ${message.author.username}: ${message.content}`
            );
        }
    }
};
```

### Example 2: Channel Management

```javascript
// Get channels by tags
const announcementChannels = global.channels.text.getByTags('announcements');
const musicChannels = global.channels.voice.getByTags('music');

// Send to all announcement channels
for (const channel of announcementChannels) {
    await channel.send('Important server update!');
}

// Get channel members
const voiceChannel = global.channels.voice.getByAlias('general');
if (voiceChannel) {
    const members = await voiceChannel.getMembers();
    console.log(`Users in voice: ${members.length}`);
}
```

### Example 3: Cache Management

```javascript
// Cache user data
const userData = {
    id: message.author.id,
    username: message.author.username,
    messageCount: 1,
    lastSeen: Date.now()
};

await global.cache.set(`user:${message.author.id}`, userData, 86400); // 24 hours

// Retrieve and update
let user = await global.cache.get(`user:${message.author.id}`);
if (user) {
    user.messageCount++;
    user.lastSeen = Date.now();
    await global.cache.set(`user:${message.author.id}`, user, 86400);
} else {
    await global.cache.set(`user:${message.author.id}`, userData, 86400);
}
```

### Example 4: Audit Log Monitoring

```javascript
// Monitor recent audit logs
const latestLog = await global.guild.latestAuditLog();
if (latestLog) {
    console.log(`Latest action: ${latestLog.action}`);
    
    if (latestLog.action === 'MEMBER_BAN_ADD') {
        console.log(`User banned: ${latestLog.target.username}`);
        console.log(`Banned by: ${latestLog.executor.username}`);
        
        // Send notification
        await global.client.sendMessageToChannel('mod-logs',
            `🚫 **User Banned**\n` +
            `User: ${latestLog.target.username}\n` +
            `Moderator: ${latestLog.executor.username}\n` +
            `Reason: ${latestLog.reason || 'No reason provided'}`
        );
    }
}
```

### Example 5: Advanced Message Fetching

```javascript
// Fetch messages with custom processing
const importantMessages = await global.channels.fetchAllMessages.call(
    textChannel,
    global.channels.fetchAllMessages.sortUp,
    (message, result) => {
        // Only include messages with specific criteria
        if (message.content.includes('URGENT') || 
            message.reactions.cache.has('🚨') ||
            message.author.id === adminId) {
            result.unshift(message);
        }
    }
);

console.log(`Found ${importantMessages.length} important messages`);
```

## Notes

- All prototypes are loaded automatically when the bot starts
- Global objects are initialized in the order defined in `index.js`
- Cache system automatically falls back to RAM if Redis is unavailable
- Console reporting functions provide structured logging with file context
- Channel management supports both aliases and tag-based filtering
- Message caching works in both Standalone (SQLite + RAM) and Component (MySQL + Redis) modes
- All async operations should be properly awaited to avoid race conditions
- The framework provides comprehensive error handling and logging throughout
