'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const configPath = path.join(__dirname, 'config', 'config.env');

function parseEnvFile(filePath) {
	if (!fs.existsSync(filePath)) {
		return {};
	}

	const content = fs.readFileSync(filePath, 'utf8');
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

function isConfigured() {
	const config = parseEnvFile(configPath);
	return !!(config.client_token && config.client_id && config.discord_guild_id);
}

function startConfigurator() {
	console.log('==================================================');
	console.log('  Cordium Configuration Panel');
	console.log('  Open your browser at: http://localhost:3001');
	console.log('==================================================\n');

	require('./configurator/server.js');
}

function startBot() {
	console.log('Starting Cordium Discord Bot...\n');
	require('./index.js');
}

const args = process.argv.slice(2);

if (args.includes('--config') || args.includes('-c')) {
	startConfigurator();
} else if (args.includes('--bot') || args.includes('-b')) {
	if (isConfigured()) {
		startConfigurator();
		startBot();
	} else {
		console.error('Error: Bot is not configured yet.');
		console.log('Please configure your bot first at http://localhost:3001\n');
		startConfigurator();
	}
} else {
	startConfigurator();
	if (isConfigured()) {
		startBot();
	} else {
		console.log('Configuration incomplete. Please open http://localhost:3001 to configure your bot.\n');
	}
}

