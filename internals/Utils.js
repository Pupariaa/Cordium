'use strict';

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function wait(t) {
	return new Promise(resolve => setTimeout(resolve, t));
}

function set(o, k, v, w = false, e = true) {
	if (typeof o !== 'object' || o === null) {
		throw new TypeError('The first argument must be an object');
	}
	Object.defineProperty(o, k, { value: v, writable: w, enumerable: e });
}

function getSet(defaultW = false, defaultE = false) {
	return function (key, value) {
		set(this, key, value, defaultW, defaultE);
		return this;
	};
}

function downloadFile(url, filePath) {
	const command = `curl "${url}" --output "${filePath}" > NUL 2>&1`;

	return new Promise((resolve, reject) => {
		exec(command, (err, stdout, stderr) => {
			if (err) {
				reject(err);
			} else {
				resolve(filePath);
			}
		});
	});
}

function getOrNull(obj, ...args) {
	return (args.length === 1 && typeof args[0] === 'string' ? args[0].split('.') : args).reduce((acc, key) => acc?.[key] ?? null, obj);
}

function validPort(port) {
	return Number.isInteger(port) && port >= 1 && port <= 65535;
}

function validChannelId(channelId) {
	const regex = /^[0-9]{17,19}$/;
	return regex.test(channelId);
}

function capitalize(word) {
	return word[0].toUpperCase() + word.slice(1);
}

function decapitalize(word) {
	return word[0].toLowerCase() + word.slice(1);
}

function toCamelCase(varname) {
	return decapitalize(varname).replace(/_(.)/g, (_, chr) => chr.toUpperCase());
}

function loadEnvPath(envValue, defaultValue) {
	return path.join(global.projectRoot, envValue ? (fs.existsSync(envValue) ? envValue : defaultValue) : defaultValue);
}

function getLoadEnvBool(key, defaultValue) {
	return (key in this) ? this[key].toLowerCase() === 'true' : defaultValue;
}

function compareObjects(obj1, obj2, path = '', seen = new WeakMap()) {
	// Check for circular references
	if (typeof obj1 === 'object' && obj1 !== null) {
		if (seen.has(obj1)) return seen.get(obj1) === obj2 ? [] : [path];
		seen.set(obj1, obj2);
	}

	if (typeof obj1 !== typeof obj2) return [path];
	if (typeof obj1 !== 'object' || obj1 === null || obj2 === null) {
		return obj1 !== obj2 ? [path] : [];
	}
	if (Array.isArray(obj1) !== Array.isArray(obj2)) return [path];

	let differences = [];

	if (Array.isArray(obj1)) {
		if (obj1.length !== obj2.length) return [path];
		for (let i = 0; i < obj1.length; i++) {
			differences.push(...compareObjects(obj1[i], obj2[i], `${path}[${i}]`, seen));
		}
	} else {
		const keys1 = Object.keys(obj1);
		const keys2 = Object.keys(obj2);
		if (keys1.length !== keys2.length) return [path];

		for (let key of keys1) {
			if (!obj2.hasOwnProperty(key)) {
				differences.push(path ? `${path}.${key}` : key);
			} else {
				differences.push(...compareObjects(obj1[key], obj2[key], path ? `${path}.${key}` : key, seen));
			}
		}
	}

	return differences;
}

// Because apparently javascript doesn't have a built-in way to do this
async function walkDirSync(dirPath, callback) {
	const files = fs.readdirSync(dirPath);
	for (const file of files) {
		const filePath = path.join(dirPath, file);
		const stats = fs.statSync(filePath);
		if (stats.isDirectory()) {
			await walkDirSync(filePath, callback);
		} else {
			await callback(filePath, stats);
		}
	}
}

async function walkDirAsync(dirPath, callback) {
	const files = fs.readdirSync(dirPath);
	const promises = [];

	for (const file of files) {
		const filePath = path.join(dirPath, file);
		const stats = fs.statSync(filePath);

		if (stats.isDirectory()) {
			promises.push(walkDirAsync(filePath, callback));
		} else {
			promises.push(callback(filePath, stats));
		}
	}

	return Promise.all(promises);
}

async function waitForFile(filePath, timeout = 5000, interval = 100) {
	const fs = require('fs').promises;
	const startTime = Date.now();
	while (Date.now() - startTime < timeout) {
		try {
			await fs.access(filePath);
			return true;
		} catch (err) {
			await wait(interval);
		}
	}
	return false;
}

function setReportFunctions() {
	// this is to avoid assigning extendLogFormat as many times as setReportFunctions is called lol
	delete require.cache[require.resolve('extend-console')]; // not enough
	console = global.originalConsole; // forget the old console object and all of its reports from the previous require
	const { defaultLogFormat } = require('extend-console');
	const { setReportEventFunctions } = require(global.eventsPath);
	const { setReportEndpointFunctions } = require(global.endpointsManagerPath);

	// Add logic to a default behavior of reports from extend-console
	function extendLogFormat(logFormat) {
		return function (logContext, ...args) {
			if (logContext.filePath && (logContext.filePath.includes('internals') || path.basename(logContext.filePath, '.js') === 'index')) {
				const parts = logContext.filePath.split('.');
				logContext.filePath = parts.slice(0, parts.length - 1).join('.');
			}
			return logFormat(logContext, ...args);
		}
	}

	const oldCreateReport = console.createReport;
	const oldCreateReportWarn = console.createReportWarn;
	const oldCreateReportError = console.createReportError;

	console.createReport = (...args) => args.length === 0 ? oldCreateReport(extendLogFormat(defaultLogFormat)) : oldCreateReport(extendLogFormat(args[0]), ...args.slice(1));
	console.createReportWarn = (...args) => args.length === 0 ? oldCreateReportWarn(extendLogFormat(defaultLogFormat)) : oldCreateReportWarn(extendLogFormat(args[0]), ...args.slice(1));
	console.createReportError = (...args) => args.length === 0 ? oldCreateReportError(extendLogFormat(defaultLogFormat)) : oldCreateReportError(extendLogFormat(args[0]), ...args.slice(1));

	console.report = console.createReport();
	console.reportWarn = console.createReportWarn();
	console.reportError = console.createReportError();

	setReportEventFunctions();
	setReportEndpointFunctions();
}

module.exports = {
	wait,
	set,
	getSet,
	downloadFile,
	getOrNull,
	validPort,
	validChannelId,
	capitalize,
	decapitalize,
	toCamelCase,
	loadEnvPath,
	getLoadEnvBool,
	compareObjects,
	walkDirSync,
	walkDirAsync,
	waitForFile,
	setReportFunctions
};