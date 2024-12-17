'use strict';

// we use 'file' as a shorthand for 'filePath' because the suffix 'Path' everywhere everytime is annoying af
// and so the content of a file goes from 'file' to 'content'
// same goes for all managers derived from this class for consistency

// this.loaded and this.watched are separate, FilesManager can watch a file that's not loaded yet
// or load a file without watching it necessarily if this.watch is set to true

const chokidar = require('chokidar');
const { walkDirSync, abstractClassBuilder } = require(global.utilsPath);

function construct(paths, report = true, watch = global.dev, defaultWatchOptions = {
	persistent: true,
	ignored: /(^|[\/\\])\../,
	ignoreInitial: true
}) {
	this.paths = paths;
	this.report = report;

	this.loaded = new Map(); // maps files' path to their loaded value
	this.watched = new Set();

	Object.defineProperty(this, '_watcher', {
		set: function (newWatcher) {
			if (this instanceof FilesManager) {
				this._watcher = newWatcher;
			} else {
				console.reportWarn('To change the watcher behavior, please modify the watchOptions instead.');
			}
		}
	});

	Object.defineProperty(this, 'watchOptions', {
		set: function (newWatchOptions) {
			if (newWatchOptions === this.watchOptions) {
				return;
			}
			this.watchOptions = { ...this.watchOptions, ...newWatchOptions };
			if (this._watcher) {
				this._watcher.close();
			}
			this._watcher = chokidar.watch([...this.watched], this.watchOptions);
		}
	});

	this.watchOptions = { ...defaultWatchOptions };

	if (watch) {
		this._watcher.on('add', this.onAdd.bind(this));
		this._watcher.on('change', this.onChange.bind(this));
		this._watcher.on('unlink', this.onUnlink.bind(this));
		this._watcher.on('addDir', this.onAddDir.bind(this));
		this._watcher.on('unlinkDir', this.onUnlinkDir.bind(this));
	}
}

const FilesManager = abstractClassBuilder('FilesManager', construct, [
	// what loading and unloading a file means
	{ name: '_load', mandatory: true }, { name: '_unload', mandatory: true },

	// callbacks to be called after the operation is done
	// reload will simply call unload then load
	{ name: '_reload' }, { name: '_watch' },

	// self explanatory, these will be called at the end of each operation if this.report is true
	{ name: 'reportLoad' }, { name: 'reportUnload' }, { name: 'reportReload' }, { name: 'reportWatch' }, { name: 'reportUnwatch' }
]);

// Updates this.paths

FilesManager.prototype.add = function (file, stats) {
	if (!this.paths.includes(file)) {
		this.paths.push(file);
	} else {
		console.reportWarn(`'"${file}"' is already in the managed paths`);
	}
};

FilesManager.prototype.addFolder = async function (file) {
	walkDirSync(file, this.add.bind(this));
};

FilesManager.prototype.remove = function (file, stats) {
	if (!this.paths.remove(file)) {
		console.reportWarn(`'"${file}"' is already not in the managed paths`);
	}
};

FilesManager.prototype.removeFolder = async function (file) {
	walkDirSync(file, this.remove.bind(this));
};

// File operations

FilesManager.prototype.load = function (file, stats) {
	if (this.loaded.has(file)) {
		console.reportWarn(`${this.constructor.name} tried ot load '"${file}"' but it's already loaded`);
		return;
	}
	this.loaded.set(file, this._load(file));
	if (this.report) {
		this.reportLoad(file);
	}
};

FilesManager.prototype.unload = function (file, stats) {
	if (!this.loaded.has(file)) {
		console.reportWarn(`${this.constructor.name} tried ot unload "${file}" but it's already unloaded or has never been`);
		return;
	}
	const content = this.loaded.get(file);
	this.loaded.delete(file);
	this._unload(file, content);
	if (this.report) {
		this.reportUnload(file);
	}
};

FilesManager.prototype.reload = function (file, stats) {
	const oldReport = this.report;
	this.report = false;
	this.unload(file);
	this.load(file);
	this.report = oldReport;
	this._reload(file);
	if (this.report) {
		this.reportReload(file);
	}
};

FilesManager.prototype.watch = function (file, stats) {
	if (!this.watch) {
		console.reportWarn(`${this.constructor.name} tried ot watch "${file}" but watch is set to false`);
		return;
	}
	if (this.watched.has(file)) {
		console.reportWarn(`${this.constructor.name} tried ot watch "${file}" but it's already being watched`);
		return;
	}
	console.assert(this._watcher, '');
	this._watcher.add(file);
	this.watched.add(file);
	this._watch(file);
	if (this.report) {
		this.reportWatch(file);
	}
};

FilesManager.prototype.unwatch = function (file, stats) {
	if (!this.watch) {
		console.reportWarn(`${this.constructor.name} tried ot unwatch "${file}" but watch is set to false`);
		return;
	}
	if (!this.watched.has(file)) {
		console.reportWarn(`${this.constructor.name} tried to unwatch "${file}" but it's already not being watched`);
		return;
	}
	console.assert(this._watcher, '');
	this._watcher.unwatch(file);
	this.watched.delete(file);
	if (this.report) {
		this.reportUnwatch(file);
	}
};

// Folder operations

FilesManager.prototype.loadFolder = function (folder) { walkDirSync(folder, file => this.load(file)); };
FilesManager.prototype.unloadFolder = function (folder) { walkDirSync(folder, file => this.unload(file)); };
FilesManager.prototype.reloadFolder = function (folder) { walkDirSync(folder, file => this.reload(file)); };
FilesManager.prototype.watchFolder = function (folder) { walkDirSync(folder, file => this.watch(file)); };
FilesManager.prototype.unwatchFolder = function (folder) { walkDirSync(folder, file => this.unwatch(file)); };

// Bulk operations

FilesManager.prototype.loadAll = function () { this.paths.forEach(this.load.bind(this)); };
FilesManager.prototype.unloadAll = function () { this.paths.forEach(this.unload.bind(this)); };
FilesManager.prototype.reloadAll = function () { this.paths.forEach(this.reload.bind(this)); };
FilesManager.prototype.watchAll = function () { this.paths.forEach(this.watch.bind(this)); };
FilesManager.prototype.unwatchAll = function () { this.paths.forEach(this.unwatch.bind(this)); };

// Chokidar

FilesManager.prototype.onAdd = function (file) { this.load(file); };
FilesManager.prototype.onChange = function (file) { this.reload(file); };
FilesManager.prototype.onUnlink = function (file) { this.unload(file); };
FilesManager.prototype.onAddDir = function (folder) { this.loadFolder(folder); };
FilesManager.prototype.onUnlinkDir = function (folder) { this.unloadFolder(folder); };

// Some utils

FilesManager.prototype.isFile = function (file) {
	try {
		return fs.statSync(file).isFile();
	} catch (err) {
		console.reportError(`Error checking if path '"${file}"' is a file`, err);
		return false;
	}
};

FilesManager.prototype.isDirectory = function (file) {
	try {
		return fs.statSync(file).isDirectory();
	} catch (err) {
		console.reportError(`Error checking if path '"${file}"' is a directory`, err);
		return false;
	}
};

// Some defaults

FilesManager.prototype.reportLoad = function (file) { console.log(`"${file}" loaded`); };
FilesManager.prototype.reportUnload = function (file) { console.log(`"${file}" unloaded`); };
FilesManager.prototype.reportReload = function (file) { console.log(`"${file}" reloaded`); };
FilesManager.prototype.reportWatch = function (file) { console.log(`Watching "${file}"...`); };
FilesManager.prototype.reportUnwatch = function (file) { console.log(`Stopped watching "${file}"`); };

module.exports = {
	FilesManager
};
