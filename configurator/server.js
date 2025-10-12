'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

const projectRoot = path.join(__dirname, '..');
const configPath = path.join(projectRoot, 'config', 'config.env');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/files', express.static(path.join(projectRoot, 'src', 'files', 'downloads')));

function parseEnvFile(content) {
	const lines = content.split('\n');
	const config = {};
	lines.forEach(line => {
		const trimmed = line.trim();
		if (trimmed && !trimmed.startsWith('#')) {
			const [key, ...valueParts] = trimmed.split('=');
			if (key) {
				config[key.trim()] = valueParts.join('=').trim();
			}
		}
	});
	return config;
}

function stringifyEnvConfig(config) {
	let content = '';
	Object.entries(config).forEach(([key, value]) => {
		content += `${key}=${value}\n`;
	});
	return content;
}

function isConfigured() {
	if (!fs.existsSync(configPath)) return false;
	const content = fs.readFileSync(configPath, 'utf8');
	const config = parseEnvFile(content);
	return !!(config.client_token && config.client_id && config.discord_guild_id);
}

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/config/status', (req, res) => {
	res.json({ configured: isConfigured() });
});

app.get('/api/config', (req, res) => {
	try {
		if (!fs.existsSync(configPath)) {
			return res.status(404).json({ error: 'Config file not found' });
		}
		const content = fs.readFileSync(configPath, 'utf8');
		const config = parseEnvFile(content);
		res.json(config);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post('/api/config', (req, res) => {
	try {
		const newConfig = req.body;
		const content = stringifyEnvConfig(newConfig);
		fs.writeFileSync(configPath, content, 'utf8');
		res.json({ success: true, configured: isConfigured() });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get('/api/files/:category', (req, res) => {
	try {
		const { category } = req.params;
		let folderPath;

		switch (category) {
			case 'commands':
				folderPath = path.join(projectRoot, 'src', 'commands');
				break;
			case 'endpoints':
				folderPath = path.join(projectRoot, 'src', 'endpoints');
				break;
			case 'events':
				folderPath = path.join(projectRoot, 'src', 'events');
				break;
			case 'sandbox':
				folderPath = path.join(projectRoot, 'src', 'sandbox');
				break;
			default:
				return res.status(400).json({ error: 'Invalid category' });
		}

		if (!fs.existsSync(folderPath)) {
			fs.mkdirSync(folderPath, { recursive: true });
		}

		const files = [];

		function walkDir(dir, baseDir = dir) {
			const items = fs.readdirSync(dir);
			items.forEach(item => {
				const fullPath = path.join(dir, item);
				const relativePath = path.relative(baseDir, fullPath);
				const stat = fs.statSync(fullPath);

				if (stat.isDirectory()) {
					walkDir(fullPath, baseDir);
				} else if (item.endsWith('.js')) {
					files.push({
						name: item,
						path: relativePath,
						fullPath: fullPath
					});
				}
			});
		}

		walkDir(folderPath);
		res.json(files);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get('/api/file/:category', (req, res) => {
	try {
		const { category } = req.params;
		const filePath = req.query.path;

		if (!filePath) {
			return res.status(400).json({ error: 'File path is required' });
		}

		let basePath;
		switch (category) {
			case 'commands':
				basePath = path.join(projectRoot, 'src', 'commands');
				break;
			case 'endpoints':
				basePath = path.join(projectRoot, 'src', 'endpoints');
				break;
			case 'events':
				basePath = path.join(projectRoot, 'src', 'events');
				break;
			case 'sandbox':
				basePath = path.join(projectRoot, 'src', 'sandbox');
				break;
			default:
				return res.status(400).json({ error: 'Invalid category' });
		}

		const fullPath = path.join(basePath, filePath);

		if (!fullPath.startsWith(basePath)) {
			return res.status(403).json({ error: 'Access denied' });
		}

		if (!fs.existsSync(fullPath)) {
			return res.status(404).json({ error: 'File not found' });
		}

		const content = fs.readFileSync(fullPath, 'utf8');
		res.json({ content });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post('/api/file/:category', (req, res) => {
	try {
		const { category } = req.params;
		const filePath = req.query.path;
		const { content } = req.body;

		if (!filePath) {
			return res.status(400).json({ error: 'File path is required' });
		}

		let basePath;
		switch (category) {
			case 'commands':
				basePath = path.join(projectRoot, 'src', 'commands');
				break;
			case 'endpoints':
				basePath = path.join(projectRoot, 'src', 'endpoints');
				break;
			case 'events':
				basePath = path.join(projectRoot, 'src', 'events');
				break;
			case 'sandbox':
				basePath = path.join(projectRoot, 'src', 'sandbox');
				break;
			default:
				return res.status(400).json({ error: 'Invalid category' });
		}

		const fullPath = path.join(basePath, filePath);

		if (!fullPath.startsWith(basePath)) {
			return res.status(403).json({ error: 'Access denied' });
		}

		fs.mkdirSync(path.dirname(fullPath), { recursive: true });
		fs.writeFileSync(fullPath, content, 'utf8');
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.delete('/api/file/:category', (req, res) => {
	try {
		const { category } = req.params;
		const filePath = req.query.path;

		if (!filePath) {
			return res.status(400).json({ error: 'File path is required' });
		}

		let basePath;
		switch (category) {
			case 'commands':
			case 'sandbox':
				basePath = path.join(projectRoot, 'src', category);
				break;
			case 'endpoints':
			case 'events':
				return res.status(403).json({ error: 'Cannot delete existing files in this category' });
			default:
				return res.status(400).json({ error: 'Invalid category' });
		}

		const fullPath = path.join(basePath, filePath);

		if (!fullPath.startsWith(basePath)) {
			return res.status(403).json({ error: 'Access denied' });
		}

		if (!fs.existsSync(fullPath)) {
			return res.status(404).json({ error: 'File not found' });
		}

		fs.unlinkSync(fullPath);
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post('/api/bot/start', (req, res) => {
	if (!isConfigured()) {
		return res.status(400).json({ error: 'Bot is not configured yet' });
	}
	res.json({ success: true, message: 'Restart the application with npm start' });
});

app.get('/api/server/info', (req, res) => {
	try {
		if (!global.guild) {
			return res.json({ error: 'Bot is not running or not connected to a guild' });
		}

		const guild = global.guild;
		const channels = [];
		const roles = [];

		guild.channels.cache.forEach(channel => {
			channels.push({
				id: channel.id,
				name: channel.name,
				type: channel.type,
				parentId: channel.parentId,
				position: channel.position,
				rawPosition: channel.rawPosition,
				members: channel.members ? channel.members.size : null,
				topic: channel.topic || null
			});
		});

		channels.sort((a, b) => {
			if (a.parentId !== b.parentId) {
				if (!a.parentId) return -1;
				if (!b.parentId) return 1;
				const parentA = channels.find(c => c.id === a.parentId);
				const parentB = channels.find(c => c.id === b.parentId);
				return (parentA?.rawPosition || 0) - (parentB?.rawPosition || 0);
			}
			return a.rawPosition - b.rawPosition;
		});

		guild.roles.cache.forEach(role => {
			roles.push({
				id: role.id,
				name: role.name,
				color: role.color,
				hexColor: role.hexColor,
				position: role.position,
				hoist: role.hoist,
				managed: role.managed,
				mentionable: role.mentionable,
				memberCount: role.members.size
			});
		});

		roles.sort((a, b) => b.position - a.position);

		const members = [];
		guild.members.cache.forEach(member => {
			const memberRoles = [];
			member.roles.cache.forEach(role => {
				if (role.name !== '@everyone') {
					memberRoles.push({
						id: role.id,
						name: role.name,
						color: role.hexColor
					});
				}
			});

			members.push({
				id: member.id,
				username: member.user.username,
				discriminator: member.user.discriminator,
				displayName: member.displayName,
				nickname: member.nickname,
				avatarURL: member.user.displayAvatarURL({ size: 128 }),
				bot: member.user.bot,
				joinedAt: member.joinedTimestamp,
				accountCreatedAt: member.user.createdTimestamp,
				premiumSince: member.premiumSinceTimestamp,
				roles: memberRoles,
				status: member.presence?.status || 'offline',
				activities: member.presence?.activities?.map(a => a.name) || [],
				color: member.displayHexColor,
				isOwner: member.id === guild.ownerId,
				permissions: member.permissions.toArray()
			});
		});

		members.sort((a, b) => {
			if (a.isOwner) return -1;
			if (b.isOwner) return 1;
			return a.displayName.localeCompare(b.displayName);
		});

		res.json({
			guildName: guild.name,
			guildId: guild.id,
			memberCount: guild.memberCount,
			ownerId: guild.ownerId,
			channels: channels,
			roles: roles,
			members: members
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post('/api/server/send-message', async (req, res) => {
	try {
		const { channelId, message } = req.body;

		if (!global.guild) {
			return res.json({ success: false, error: 'Bot is not running' });
		}

		const channel = global.guild.channels.cache.get(channelId);
		if (!channel) {
			return res.json({ success: false, error: 'Channel not found' });
		}

		if (!channel.isTextBased()) {
			return res.json({ success: false, error: 'This is not a text channel' });
		}

		await channel.send(message);
		res.json({ success: true });
	} catch (err) {
		res.json({ success: false, error: err.message });
	}
});

app.get('/api/server/role-members', (req, res) => {
	try {
		const { roleId } = req.query;

		if (!global.guild) {
			return res.json({ error: 'Bot is not running' });
		}

		const role = global.guild.roles.cache.get(roleId);
		if (!role) {
			return res.json({ error: 'Role not found' });
		}

		const members = [];
		role.members.forEach(member => {
			members.push({
				id: member.id,
				username: member.user.username,
				displayName: member.displayName,
				nickname: member.nickname
			});
		});

		res.json({ members });
	} catch (err) {
		res.json({ error: err.message });
	}
});

app.post('/api/server/create-channel', async (req, res) => {
	try {
		const { name, type, parentId } = req.body;

		if (!global.guild) {
			return res.json({ success: false, error: 'Bot is not running' });
		}

		const channelData = { name, type };
		if (parentId) channelData.parent = parentId;

		await global.guild.channels.create(channelData);
		res.json({ success: true });
	} catch (err) {
		res.json({ success: false, error: err.message });
	}
});

app.post('/api/server/edit-channel', async (req, res) => {
	try {
		const { channelId, name, topic } = req.body;

		if (!global.guild) {
			return res.json({ success: false, error: 'Bot is not running' });
		}

		const channel = global.guild.channels.cache.get(channelId);
		if (!channel) {
			return res.json({ success: false, error: 'Channel not found' });
		}

		const updates = {};
		if (name) updates.name = name;
		if (topic !== null) updates.topic = topic;

		await channel.edit(updates);
		res.json({ success: true });
	} catch (err) {
		res.json({ success: false, error: err.message });
	}
});

app.post('/api/server/delete-channel', async (req, res) => {
	try {
		const { channelId } = req.body;

		if (!global.guild) {
			return res.json({ success: false, error: 'Bot is not running' });
		}

		const channel = global.guild.channels.cache.get(channelId);
		if (!channel) {
			return res.json({ success: false, error: 'Channel not found' });
		}

		await channel.delete();
		res.json({ success: true });
	} catch (err) {
		res.json({ success: false, error: err.message });
	}
});

app.post('/api/server/create-role', async (req, res) => {
	try {
		const { name, color } = req.body;

		if (!global.guild) {
			return res.json({ success: false, error: 'Bot is not running' });
		}

		await global.guild.roles.create({
			name,
			color: color || '#99AAB5'
		});
		res.json({ success: true });
	} catch (err) {
		res.json({ success: false, error: err.message });
	}
});

app.post('/api/server/edit-role', async (req, res) => {
	try {
		const { roleId, name, color } = req.body;

		if (!global.guild) {
			return res.json({ success: false, error: 'Bot is not running' });
		}

		const role = global.guild.roles.cache.get(roleId);
		if (!role) {
			return res.json({ success: false, error: 'Role not found' });
		}

		const updates = {};
		if (name) updates.name = name;
		if (color) updates.color = color;

		await role.edit(updates);
		res.json({ success: true });
	} catch (err) {
		res.json({ success: false, error: err.message });
	}
});

app.post('/api/server/delete-role', async (req, res) => {
	try {
		const { roleId } = req.body;

		if (!global.guild) {
			return res.json({ success: false, error: 'Bot is not running' });
		}

		const role = global.guild.roles.cache.get(roleId);
		if (!role) {
			return res.json({ success: false, error: 'Role not found' });
		}

		await role.delete();
		res.json({ success: true });
	} catch (err) {
		res.json({ success: false, error: err.message });
	}
});

app.post('/api/server/assign-role', async (req, res) => {
	try {
		const { roleId, userId } = req.body;

		if (!global.guild) {
			return res.json({ success: false, error: 'Bot is not running' });
		}

		const role = global.guild.roles.cache.get(roleId);
		if (!role) {
			return res.json({ success: false, error: 'Role not found' });
		}

		const member = await global.guild.members.fetch(userId);
		if (!member) {
			return res.json({ success: false, error: 'Member not found' });
		}

		await member.roles.add(role);
		res.json({ success: true });
	} catch (err) {
		res.json({ success: false, error: err.message });
	}
});

app.get('/api/server/member-details', async (req, res) => {
	try {
		const { memberId } = req.query;

		if (!global.guild) {
			return res.json({ error: 'Bot is not running' });
		}

		const member = await global.guild.members.fetch(memberId);
		if (!member) {
			return res.json({ error: 'Member not found' });
		}

		const memberRoles = [];
		member.roles.cache.forEach(role => {
			if (role.name !== '@everyone') {
				memberRoles.push({
					id: role.id,
					name: role.name,
					color: role.hexColor
				});
			}
		});

		res.json({
			member: {
				id: member.id,
				username: member.user.username,
				discriminator: member.user.discriminator,
				displayName: member.displayName,
				nickname: member.nickname,
				avatarURL: member.user.displayAvatarURL({ size: 256 }),
				bot: member.user.bot,
				joinedAt: member.joinedTimestamp,
				accountCreatedAt: member.user.createdTimestamp,
				premiumSince: member.premiumSinceTimestamp,
				roles: memberRoles,
				status: member.presence?.status || 'offline',
				activities: member.presence?.activities?.map(a => a.name) || [],
				color: member.displayHexColor,
				isOwner: member.id === global.guild.ownerId,
				permissions: member.permissions.toArray()
			}
		});
	} catch (err) {
		res.json({ error: err.message });
	}
});

app.post('/api/server/add-member-role', async (req, res) => {
	try {
		const { memberId, roleId } = req.body;

		if (!global.guild) {
			return res.json({ success: false, error: 'Bot is not running' });
		}

		const member = await global.guild.members.fetch(memberId);
		const role = global.guild.roles.cache.get(roleId);

		if (!member) return res.json({ success: false, error: 'Member not found' });
		if (!role) return res.json({ success: false, error: 'Role not found' });

		await member.roles.add(role);
		res.json({ success: true });
	} catch (err) {
		res.json({ success: false, error: err.message });
	}
});

app.post('/api/server/remove-member-role', async (req, res) => {
	try {
		const { memberId, roleId } = req.body;

		if (!global.guild) {
			return res.json({ success: false, error: 'Bot is not running' });
		}

		const member = await global.guild.members.fetch(memberId);
		const role = global.guild.roles.cache.get(roleId);

		if (!member) return res.json({ success: false, error: 'Member not found' });
		if (!role) return res.json({ success: false, error: 'Role not found' });

		await member.roles.remove(role);
		res.json({ success: true });
	} catch (err) {
		res.json({ success: false, error: err.message });
	}
});

app.post('/api/server/change-nickname', async (req, res) => {
	try {
		const { memberId, nickname } = req.body;

		if (!global.guild) {
			return res.json({ success: false, error: 'Bot is not running' });
		}

		const member = await global.guild.members.fetch(memberId);
		if (!member) return res.json({ success: false, error: 'Member not found' });

		await member.setNickname(nickname || null);
		res.json({ success: true });
	} catch (err) {
		res.json({ success: false, error: err.message });
	}
});

app.post('/api/server/timeout-member', async (req, res) => {
	try {
		const { memberId, duration, reason } = req.body;

		if (!global.guild) {
			return res.json({ success: false, error: 'Bot is not running' });
		}

		const member = await global.guild.members.fetch(memberId);
		if (!member) return res.json({ success: false, error: 'Member not found' });

		const timeoutUntil = Date.now() + (duration * 60 * 1000);
		await member.timeout(timeoutUntil, reason || 'No reason provided');
		res.json({ success: true });
	} catch (err) {
		res.json({ success: false, error: err.message });
	}
});

app.post('/api/server/kick-member', async (req, res) => {
	try {
		const { memberId, reason } = req.body;

		if (!global.guild) {
			return res.json({ success: false, error: 'Bot is not running' });
		}

		const member = await global.guild.members.fetch(memberId);
		if (!member) return res.json({ success: false, error: 'Member not found' });

		await member.kick(reason || 'No reason provided');
		res.json({ success: true });
	} catch (err) {
		res.json({ success: false, error: err.message });
	}
});

app.post('/api/server/ban-member', async (req, res) => {
	try {
		const { memberId, reason, deleteMessageDays } = req.body;

		if (!global.guild) {
			return res.json({ success: false, error: 'Bot is not running' });
		}

		await global.guild.members.ban(memberId, {
			reason: reason || 'No reason provided',
			deleteMessageDays: deleteMessageDays || 0
		});
		res.json({ success: true });
	} catch (err) {
		res.json({ success: false, error: err.message });
	}
});

app.post('/api/test-db', async (req, res) => {
	try {
		const { host, name, port, user, pass } = req.body;

		if (!host || !name) {
			return res.json({ success: false, error: 'Host and database name are required' });
		}

		let mysql;
		try {
			mysql = require('mysql2/promise');
		} catch (err) {
			return res.json({
				success: false,
				error: 'MySQL driver not installed. Run: npm install mysql2'
			});
		}

		const connection = await mysql.createConnection({
			host: host,
			port: port || 3306,
			user: user || 'root',
			password: pass || '',
			database: name,
			connectTimeout: 5000
		});

		await connection.ping();
		await connection.end();

		res.json({ success: true, message: 'Connection successful' });
	} catch (err) {
		res.json({ success: false, error: err.message });
	}
});

app.get('/api/server/messages', async (req, res) => {
	try {
		if (!global.messagesCache) {
			return res.json({ error: 'Messages cache not initialized' });
		}

		if (!global.redisOnline) {
			return res.json({ error: 'Redis is not configured. Enable Redis in Settings to use this feature.' });
		}

		const { limit, offset } = req.query;
		const result = await global.messagesCache.getMessages(
			parseInt(limit) || 30,
			offset ? parseInt(offset) : null
		);

		res.json(result);
	} catch (err) {
		res.json({ error: err.message });
	}
});

app.post('/api/server/message-priority', async (req, res) => {
	try {
		const { messageId, isPriority } = req.body;

		if (!global.messagesCache) {
			return res.json({ success: false, error: 'Messages cache not initialized' });
		}

		await global.messagesCache.setPriority(messageId, isPriority);
		res.json({ success: true });
	} catch (err) {
		res.json({ success: false, error: err.message });
	}
});

app.get('/api/server/loading-progress', (req, res) => {
	try {
		if (!global.messagesCache) {
			return res.json({ error: 'Messages cache not initialized' });
		}

		res.json(global.messagesCache.loadingProgress);
	} catch (err) {
		res.json({ error: err.message });
	}
});

app.get('/api/server/messages-stats', async (req, res) => {
	try {
		if (!global.messagesCache) {
			return res.json({ error: 'Messages cache not initialized' });
		}

		const stats = await global.messagesCache.getStats();
		res.json(stats);
	} catch (err) {
		res.json({ error: err.message });
	}
});

app.get('/api/server/message-history', async (req, res) => {
	try {
		const { messageId } = req.query;

		console.log('Fetching history for message:', messageId);

		if (!global.messagesCache) {
			console.log('Messages cache not initialized');
			return res.json({ error: 'Messages cache not initialized' });
		}

		if (!messageId) {
			console.log('No message ID provided');
			return res.json({ error: 'Message ID required' });
		}

		const history = await global.messagesCache.getMessageHistory(messageId);
		console.log('History retrieved:', {
			edits: history.edits.length,
			reactions: history.reactions.length,
			replies: history.replies.length
		});

		res.json(history);
	} catch (err) {
		console.error('Error fetching message history:', err);
		res.json({ error: err.message });
	}
});

app.get('/api/server/cache-stats', (req, res) => {
	try {
		if (!global.cache) {
			return res.json({ error: 'Cache not initialized' });
		}

		const stats = global.cache.getStats();
		res.json(stats);
	} catch (err) {
		res.json({ error: err.message });
	}
});

app.post('/api/server/delete-message', async (req, res) => {
	try {
		const { messageId, channelId } = req.body;

		if (!global.guild) {
			return res.json({ success: false, error: 'Bot is not running' });
		}

		const channel = global.guild.channels.cache.get(channelId);
		if (!channel) {
			return res.json({ success: false, error: 'Channel not found' });
		}

		if (!channel.isTextBased()) {
			return res.json({ success: false, error: 'Not a text channel' });
		}

		try {
			const message = await channel.messages.fetch(messageId);
			if (message) {
				await message.delete();
			}
		} catch (err) {
			console.reportWarn('Message not found in Discord, removing from cache only');
		}

		if (global.messagesCache) {
			await global.messagesCache.deleteMessage(messageId);
		}

		res.json({ success: true });
	} catch (err) {
		res.json({ success: false, error: err.message });
	}
});

app.post('/api/server/cache-flush', async (req, res) => {
	try {
		if (!global.cache) {
			return res.json({ success: false, error: 'Cache not initialized' });
		}

		await global.cache.flush();
		res.json({ success: true });
	} catch (err) {
		res.json({ success: false, error: err.message });
	}
});

app.post('/api/test-redis', async (req, res) => {
	try {
		const { host, port, password, db } = req.body;

		if (!host) {
			return res.json({ success: false, error: 'Host is required' });
		}

		let redis;
		try {
			redis = require('redis');
		} catch (err) {
			return res.json({
				success: false,
				error: 'Redis driver not installed. Run: npm install redis'
			});
		}

		const client = redis.createClient({
			socket: {
				host: host,
				port: port || 6379,
				connectTimeout: 5000
			},
			password: password || undefined,
			database: parseInt(db) || 0
		});

		await client.connect();
		await client.ping();
		await client.quit();

		res.json({ success: true, message: 'Redis connection successful' });
	} catch (err) {
		res.json({ success: false, error: err.message });
	}
});

const server = app.listen(PORT, () => {
	console.log(`Cordium Configurator running on http://localhost:${PORT}`);
	console.log(`Open your browser to configure your bot`);
});

module.exports = { app, server };

