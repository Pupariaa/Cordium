'use strict';

const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { FilesManager } = require(global.filesManagerPath);
const { getSet, getOtherwise, capitalize, toCamelCase } = require(global.utilsPath);

const set = getSet().bind(global);

function reportIssue(issueList, message, reportFunction) {
	if (issueList.length > 0) {
		console[reportFunction](`${message}:`, ...issueList);
		return true;
	}
	return false;
}

class ConfigManager extends FilesManager {
	constructor(envPath, items) {
		super([envPath]);
		this.items = items;
	}

	fileToKey(file) {
		return path.basename(file, '.env');
	}

	_load(file) {
		const envConfig = dotenv.config({ path: file });
		if (envConfig.error) {
			console.reportError(`Error parsing ${file}:`, envConfig.error);
			process.exit(1);
		}
		const env = envConfig?.parsed || {};

		this.defaultedRequired = [];
		this.lacking = [];
		this.nonMatchingType = [];
		this.missing = [];
		this.unvalidated = [];
		this.unsupportedType = [];
		this.failedParsing = [];

		const setKeys = Object.entries(this.items).map(([key, info]) => this.loadEnv(env, key, info));

		if (this.reportEnvironmentIssues()) {
			process.exit(1);
		}

		return setKeys;
	}

	_unload(file, loaded) {
		loaded.forEach((key) => delete global[key]);
	}

	reportEnvironmentIssues() {
		reportIssue(this.defaultedRequired, 'The following keys are marked as required but also have default values', 'reportWarn');
		reportIssue(this.lacking, 'The following keys are optional but lack both a value and a default', 'reportWarn');
		reportIssue(this.nonMatchingType, 'The following keys\' defaultValue do not match their type', 'reportWarn');
		return reportIssue(this.missing, 'The following required keys are missing from the environment file', 'reportError')
			|| reportIssue(this.unvalidated, 'The following keys failed validation', 'reportError')
			|| reportIssue(this.unsupportedType, 'The following keys have unsupported types', 'reportError')
			|| reportIssue(this.failedParsing, 'The following keys do not match their supposed types or are ill-formed', 'reportError');
	}

	loadEnv(env, key, info) {
		const type = getOtherwise(info, 'type', 'string');
		const required = getOtherwise(info, 'required', false);
		const [hasDefaultValue, defaultValue] = getOtherwise(info, 'defaultValue');
		if (required && hasDefaultValue) {
			this.defaultedRequired.push(key);
		}
		const validate = getOtherwise(info, 'validate', x => true);
		const transformKey = getOtherwise(info, 'transformKey', k => toCamelCase(k));
		const transformValue = getOtherwise(info, 'transformValue', v => v);
		let [hasKey, value] = getOtherwise(env, key);

		if (hasKey) {
			console.assert(typeof value === 'string');
			switch (type) {
				case 'string':
					break;
				case 'bool':
					value = value === 'true';
					break;
				case 'int':
					value = parseInt(value);
					if (isNaN(value) || !Number.isInteger(value)) {
						this.failedParsing.push(key);
						return;
					}
					break;
				case 'float':
					value = parseFloat(value);
					if (isNaN(value)) {
						this.failedParsing.push(key);
						return;
					}
					break;
				case 'json':
					try {
						value = JSON.parse(value);
					} catch (e) {
						this.failedParsing.push(key);
						return;
					}
					break;
				default:
					this.unsupportedType.push(key);
					return;
			}
		}
		else {
			if (required) {
				this.missing.push(key);
				return;
			}
			if (!hasDefaultValue) {
				this.lacking.push(key);
			}
			if (typeof defaultValue !== type) {
				this.nonMatchingType.push(key);
			}
			value = defaultValue;
		}

		if (!validate(value, key, info)) {
			this.unvalidated.push(key);
			return;
		}

		const transformedKey = transformKey(key);
		set(transformedKey, transformValue(value));

		return transformedKey;
	}
}

function loadJsonConfig(file, defaultValue, validate, transformKey = k => `config${capitalize(toCamelCase(k))}`, transformValue = v => v) {
	try {
		const content = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : defaultValue;
		const filename = path.basename(file, '.json');
		if (validate && !validate(content, file, defaultValue, filename)) {
			throw new Error('not valid');
		}
		set(transformKey(filename), transformValue(content));
		return { file, content };
	} catch (err) {
		console.reportError(`Error loading ${file}:`, err);
		process.exit(1);
	}
}

module.exports = {
	ConfigManager,
	loadJsonConfig
};
