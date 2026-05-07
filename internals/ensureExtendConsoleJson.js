'use strict';

const fs = require('fs');
const path = require('path');

function readJsonFile(filePath) {
	try {
		const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
		if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
			return parsed;
		}
	} catch {
	}
	return {};
}

function bundledExtendConsoleBlock(projectRoot) {
	const entry = require.resolve('extend-console/package.json', { paths: [projectRoot] });
	const bundledPath = path.join(path.dirname(entry), 'config', 'config.json');
	const full = readJsonFile(bundledPath);
	return full['extend-console'];
}

function normalizeExtendConsoleValue(data, projectRoot) {
	const ec = data['extend-console'];
	if (ec !== null && typeof ec === 'object' && !Array.isArray(ec)) {
		return false;
	}
	const block = bundledExtendConsoleBlock(projectRoot);
	if (!block || typeof block !== 'object' || Array.isArray(block)) {
		throw new Error('extend-console defaults missing');
	}
	data['extend-console'] = block;
	return true;
}

function ensureExtendConsoleJson(projectRoot) {
	const configJsonPath = path.join(projectRoot, 'config', 'config.json');
	const data = fs.existsSync(configJsonPath) ? readJsonFile(configJsonPath) : {};
	if (!normalizeExtendConsoleValue(data, projectRoot)) {
		return;
	}
	fs.mkdirSync(path.dirname(configJsonPath), { recursive: true });
	fs.writeFileSync(configJsonPath, JSON.stringify(data, null, 2), 'utf8');
}

function mergeConfigJsonObjects(existing, incoming) {
	const base = existing && typeof existing === 'object' && !Array.isArray(existing) ? { ...existing } : {};
	const next = incoming && typeof incoming === 'object' && !Array.isArray(incoming) ? incoming : {};
	const merged = { ...base, ...next };
	const bEc = base['extend-console'];
	const nEc = next['extend-console'];
	if (
		bEc && typeof bEc === 'object' && !Array.isArray(bEc) &&
		nEc && typeof nEc === 'object' && !Array.isArray(nEc)
	) {
		merged['extend-console'] = { ...bEc, ...nEc };
	}
	return merged;
}

module.exports = {
	ensureExtendConsoleJson,
	mergeConfigJsonObjects,
	readJsonFile,
};
