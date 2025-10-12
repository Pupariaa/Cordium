'use strict';

class RedisManager {
	constructor() {
		this.client = null;
		this.connected = false;
		global.redisOnline = false;
		global.sigintSubscribers.push(this.close.bind(this));
	}

	async init() {
		return new Promise(async (resolve, reject) => {
			if (!process.env.redis_host || !process.env.redis_port) {
				console.reportWarn('Redis connection parameters are missing. Running without cache');
				return resolve();
			}

			try {
				const redis = require('redis');

				this.client = redis.createClient({
					socket: {
						host: process.env.redis_host,
						port: parseInt(process.env.redis_port) || 6379,
						connectTimeout: 5000
					},
					password: process.env.redis_password || undefined,
					database: parseInt(process.env.redis_db) || 0
				});

				this.client.on('error', (err) => {
					console.reportError('Redis Client Error:', err);
					global.redisOnline = false;
					this.connected = false;
				});

				this.client.on('connect', () => {
					console.report('Redis connected successfully');
					global.redisOnline = true;
					this.connected = true;
				});

				this.client.on('reconnecting', () => {
					console.reportWarn('Redis reconnecting...');
				});

				await this.client.connect();
				resolve();
			} catch (err) {
				console.reportError('Redis initialization failed:', err);
				console.reportWarn('Continuing without Redis cache');
				reject(err);
			}
		});
	}

	async get(key) {
		if (!this.connected || !this.client) return null;
		try {
			const value = await this.client.get(key);
			return value ? JSON.parse(value) : null;
		} catch (err) {
			console.reportError(`Redis GET error for key ${key}:`, err);
			return null;
		}
	}

	async set(key, value, expirationSeconds = null) {
		if (!this.connected || !this.client) return false;
		try {
			const stringValue = JSON.stringify(value);
			if (expirationSeconds) {
				await this.client.setEx(key, expirationSeconds, stringValue);
			} else {
				await this.client.set(key, stringValue);
			}
			return true;
		} catch (err) {
			console.reportError(`Redis SET error for key ${key}:`, err);
			return false;
		}
	}

	async del(key) {
		if (!this.connected || !this.client) return false;
		try {
			await this.client.del(key);
			return true;
		} catch (err) {
			console.reportError(`Redis DEL error for key ${key}:`, err);
			return false;
		}
	}

	async exists(key) {
		if (!this.connected || !this.client) return false;
		try {
			const result = await this.client.exists(key);
			return result === 1;
		} catch (err) {
			console.reportError(`Redis EXISTS error for key ${key}:`, err);
			return false;
		}
	}

	async flush() {
		if (!this.connected || !this.client) return false;
		try {
			await this.client.flushDb();
			console.report('Redis database flushed');
			return true;
		} catch (err) {
			console.reportError('Redis FLUSH error:', err);
			return false;
		}
	}

	async keys(pattern) {
		if (!this.connected || !this.client) return [];
		try {
			return await this.client.keys(pattern);
		} catch (err) {
			console.reportError(`Redis KEYS error for pattern ${pattern}:`, err);
			return [];
		}
	}

	async close() {
		if (this.client && this.connected) {
			try {
				await this.client.quit();
				console.report('Redis connection closed');
			} catch (err) {
				console.reportError('Error closing Redis connection:', err);
			}
		}
	}
}

module.exports = RedisManager;

