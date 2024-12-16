'use strict';

const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { FilesManager } = require(global.filesManagerPath);
const { getSet, capitalize, toCamelCase } = require(global.utilsPath);
const { Events } = require('discord.js');

const set = getSet().bind(global);

class ConfigManager extends FilesManager {
	constructor(envPath) {
		super();
		this.filePaths.push(envPath);
		const envConfig = dotenv.config({ path: envPath });
		if (envConfig.error) {
			console.reportError(`Error parsing ${envPath}:`, envConfig.error);
			process.exit(1);
		}
		this.env = envConfig?.parsed || {};
	}

	load() {
		throw new Error('Method "load" must be implemented in subclass.');
	}

	watch() {
		this.watchFilePaths(`Watching ${this.filePaths[0]}...`);
	}

	loadEnvAny(key, defaultValue, validate, transform = v => v) {
		const value = key in this.env ? this.env[key] : defaultValue;
		return set(toCamelCase(key), transform(validate ? (validate(value, key, defaultValue) ? value : defaultValue) : value));
	}

	loadEnvPath(key, defaultValue, validate) {
		return this.loadEnvAny(key, defaultValue, validate, v => path.join(global.projectRoot, v));
	}

	loadEnvBool(key, defaultValue) {
		return this.loadEnvAny(key, defaultValue, v => v === 'true');
	}

	loadEnvString(key, defaultValue, validate) {
		return this.loadEnvAny(key, defaultValue, validate);
	}

	loadEnvJsonObject(key, defaultValue, validate) {
		return this.loadEnvAny(key, defaultValue, validate, v => JSON.parse(v));
	}

	loadRequiredAny(keys, loader) {
		const missingVars = keys.filter(key => loader.call(this, key, null) === null);
		if (missingVars.length > 0) {
			console.reportError(`Missing required config in ${this.envPath}:`, ...missingVars);
			process.exit(1);
		}
	}

	loadRequiredStrings(keys) {
		this.loadRequiredAny(keys, this.loadEnvString);
	}

	loadRequiredBools(keys) {
		this.loadRequiredAny(keys, this.loadEnvBool);
	}

	loadRequiredPaths(keys) {
		this.loadRequiredAny(keys, this.loadEnvPath);
	}

	loadRequiredJsonObjects(keys) {
		this.loadRequiredAny(keys, this.loadEnvJsonObject);
	}
}

function loadJsonConfig(filePath, defaultValue, validate) {
	try {
		const file = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) : defaultValue;
		const filename = path.basename(filePath, '.json');
		if (validate && !validate(file, filePath, defaultValue, filename)) {
			throw new Error("not valid");
		}
		set(`config${capitalize(toCamelCase(filename))}`, file);
		return { filePath, file };
	} catch (err) {
		console.reportError(`Error loading ${filePath}:`, err);
		process.exit(1);
	}
}

module.exports = {
	ConfigManager,
	loadJsonConfig
};
