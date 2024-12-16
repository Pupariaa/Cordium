'use strict';

const chokidar = require('chokidar');
const { abstractClassBuilder } = require(global.utilsPath);

function construct() {
	this.filePaths = [];
}

const FilesManager = abstractClassBuilder('FilesManager', construct, [
	{ name: 'init', isAsync: true },
	{ name: 'unload', args: ['filePath'] },
	{ name: 'load', args: ['filePath'] }
]);

FilesManager.prototype.reload = function (filePath) {
	this.unload(filePath);
	this.load(filePath);
}

FilesManager.prototype.onChange = function (filePath) {
	this.reload(filePath);
}

FilesManager.prototype.runAll = function (callback) {
	this.filePaths.forEach(callback.bind(this));
}

FilesManager.prototype.unloadAll = function () {
	this.runAll(filePath => this.unload(filePath));
}

FilesManager.prototype.loadAll = function () {
	this.runAll(filePath => this.load(filePath));
}

FilesManager.prototype.reloadAll = function () {
	this.unloadAll();
	this.loadAll();
}

FilesManager.prototype.watchFilePaths = function (msg = null, watchOptions = {
		persistent: true,
		ignored: /(^|[\/\\])\../,
		ignoreInitial: true,
	}) {
	const watcher = chokidar.watch(this.filePaths, watchOptions);

	watcher.on('change', this.onChange.bind(this));
	watcher.on('add', this.onChange.bind(this))
	if (msg) {
		console.report(msg);
	}
}

module.exports = {
	FilesManager
};
