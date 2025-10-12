'use strict';

class CacheManager {
	constructor() {
		this.memoryCache = new Map();
		this.stats = {
			hits: 0,
			misses: 0,
			redisHits: 0,
			memoryHits: 0
		};
	}

	async get(key) {
		if (global.redisOnline) {
			const value = await global.redisManager.get(key);
			if (value !== null) {
				this.stats.hits++;
				this.stats.redisHits++;
				return value;
			}
		}

		if (this.memoryCache.has(key)) {
			this.stats.hits++;
			this.stats.memoryHits++;
			return this.memoryCache.get(key);
		}

		this.stats.misses++;
		return null;
	}

	async set(key, value, ttl = null) {
		if (global.redisOnline) {
			await global.redisManager.set(key, value, ttl);
		}

		this.memoryCache.set(key, value);

		if (ttl) {
			setTimeout(() => {
				this.memoryCache.delete(key);
			}, ttl * 1000);
		}

		return true;
	}

	async del(key) {
		if (global.redisOnline) {
			await global.redisManager.del(key);
		}

		return this.memoryCache.delete(key);
	}

	async exists(key) {
		if (global.redisOnline) {
			return await global.redisManager.exists(key);
		}

		return this.memoryCache.has(key);
	}

	async flush() {
		if (global.redisOnline) {
			await global.redisManager.flush();
		}

		this.memoryCache.clear();
		this.stats = {
			hits: 0,
			misses: 0,
			redisHits: 0,
			memoryHits: 0
		};

		return true;
	}

	getStats() {
		const total = this.stats.hits + this.stats.misses;
		return {
			...this.stats,
			hitRate: total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) + '%' : '0%',
			total: total,
			memorySize: this.memoryCache.size,
			redisEnabled: global.redisOnline
		};
	}
}

module.exports = CacheManager;

