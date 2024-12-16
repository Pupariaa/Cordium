'use strict';

const chokidar = require('chokidar');
const { Collection } = require('discord.js');
const { abstractClassBuilder } = require(global.utilsPath);

function construct() {
	this.ressources = new Collection();
}

const FilesManager = abstractClassBuilder('FilesManager', construct, [
	{ name: 'init', isAsync: true },
	{ name: 'unload', args: ['ressource'] },
	{ name: 'load', args: ['ressource'] }
]);

FilesManager.prototype.reload = function (ressource) {
	this.unload(ressource);
	this.load(ressource);
}

FilesManager.prototype.onChange = function (ressource) {
	this.reload(ressource);
}

FilesManager.prototype.runAll = function (callback) {
	this.ressources.forEach(callback.bind(this));
}

FilesManager.prototype.unloadAll = function () {
	this.runAll(ressource => this.unload(ressource));
}

FilesManager.prototype.loadAll = function () {
	this.runAll(ressource => this.load(ressource));
}

FilesManager.prototype.reloadAll = function () {
	this.unloadAll();
	this.loadAll();
}

FilesManager.prototype.watchFilePaths = function (filePaths, msg = null, watchOptions = {
		persistent: true,
		ignored: /(^|[\/\\])\../,
		ignoreInitial: true,
	}) {
	const watcher = chokidar.watch(filePaths, watchOptions);

	watcher.on('change', this.onChange.bind(this));
	watcher.on('add', this.onChange.bind(this))
	if (msg) {
		console.report(msg);
	}
}

module.exports = {
	FilesManager
};
