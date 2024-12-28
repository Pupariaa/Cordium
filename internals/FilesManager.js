'use strict';

// we use 'file' as a shorthand for 'filePath' because the suffix 'Path' everywhere everytime is annoying af
// and so the content of a file goes from 'file' to 'content'
// same goes for all managers derived from this class for consistency

// this.loaded and this.watched are separate, FilesManager can watch a file that's not loaded yet
// or load a file without watching it necessarily if this.watch is set to true

const path = require('path');
const chokidar = require('chokidar');
const { set, walkDirSync, abstractClassBuilder } = require(global.utilsPath);

const defaultWatchOptions = {
	persistent: true,
	ignored: /(^|[\/\\])\../,
	ignoreInitial: true
};

function construct(paths, report = true, watch = global.dev, watchOptions = defaultWatchOptions) {
	this.paths = paths;
	this.report = report;
	this.watch = watch;
	this.watchOptions = watchOptions;
}

set(module, 'FilesManager', undefined, true, true, true);

function setWatcher(valueKey, newWatcher) {
	if (!(this instanceof module.FilesManager)) {
		console.reportWarn('To change the watcher behavior, please modify the watchOptions instead');
		return;
	}
	this[valueKey] = newWatcher;
	this.watcher.on('add', this.onAdd.bind(this));
	this.watcher.on('change', this.onChange.bind(this));
	this.watcher.on('unlink', this.onUnlink.bind(this));
	this.watcher.on('addDir', this.onAddDir.bind(this));
	this.watcher.on('unlinkDir', this.onUnlinkDir.bind(this));
}

function setWatch(valueKey, value) {
	if (value === this.watch) {
		return;
	}

	if (value === false) {
		if (this.watcher) {
			this.watcher.close();
			this.watcher = null;
		}
	} else if (value === true && !this.watcher) {
		this.watcher = chokidar.watch([...this.watched], this.watchOptions);
	}

	this[valueKey] = value;
}

function setWatchOptions(valueKey, newWatchOptions) {
	if (newWatchOptions === this.watchOptions) {
		return;
	}
	this[valueKey] = { ...this.watchOptions, ...newWatchOptions };
	if (!this.watch) {
		return;
	}
	if (this.watcher) {
		this.watcher.close();
	}
	this.watcher = chokidar.watch([...this.watched], this.watchOptions);
}

module.FilesManager = abstractClassBuilder('FilesManager', construct,
[
	{ name: 'paths', defaultValue: [] }, // paths to take action on if a XAll method is called
	{ name: 'report', defaultValue: true }, // if should report at all
	{ name: 'loaded', defaultValue: new Map() }, // currently loaded files, it maps paths to their loaded value
	{ name: 'watched', defaultValue: new Set() }, // actively watched files
	{ name: 'watcher', setter: setWatcher },
	{ name: 'watchOptions', setter: setWatchOptions, defaultValue: defaultWatchOptions }, // updates the watcher if the options are changed
	{ name: 'watch', setter: setWatch, defaultValue: false }, // starts or closes the watcher automatically accordingly
],
[
	// How to format file to a key in the loaded map
	
	{ name: 'fileToKey', impl: function (file) {
		return path.basename(file, '.js');
	}},

	// What loading and unloading a file means
	
	{ name: '_load', mandatory: true }, { name: '_unload', mandatory: true },

	// callbacks to be called after the corresponding operation is done
	// reload will simply call unload then load then call _reload
	// and watch will add it to the watcher then call _watch
	
	{ name: '_reload' }, { name: '_watch' },

	// Updates this.paths

	{ name: 'add', impl: function (file, stats) {
		if (!this.paths.includes(file)) {
			this.paths.push(file);
		} else {
			console.reportWarn(`'"${file}"' is already in the managed paths`);
		}
	}},

	{ name: 'addFolder', impl: async function addFolder(file) {
		walkDirSync(file, this.add.bind(this));
	}},

	{ name: 'remove', impl: function (file, stats) {
		if (!this.paths.remove(file)) {
			console.reportWarn(`'"${file}"' is already not in the managed paths`);
		}
	}},

	{ name: 'removeFolder', impl: async function (file) {
		walkDirSync(file, this.remove.bind(this));
	}},

	// File operations

	{ name: 'load', impl: function (file, stats) {
		const fileKey = this.fileToKey(file);
		if (this.loaded.has(fileKey)) {
			console.reportWarn(`${this.constructor.name} tried ot load '"${file}"' but it's already loaded`);
			return;
		}
		this.loaded.set(fileKey, this._load(file));
		if (this.report) {
			this.reportLoad(file);
		}
	}},

	{ name: 'unload', impl: function (file, stats) {
		const fileKey = this.fileToKey(file);
		if (!this.loaded.has(fileKey)) {
			console.reportWarn(`${this.constructor.name} tried ot unload "${file}" but it's already unloaded or has never been`);
			return;
		}
		const content = this.loaded.get(fileKey);
		this.loaded.delete(fileKey);
		this._unload(file, content);
		if (this.report) {
			this.reportUnload(file);
		}
	}},

	{ name: 'reload', impl: function (file, stats) {
		const oldReport = this.report;
		this.report = false;
		this.unload(file);
		this.load(file);
		this.report = oldReport;
		this._reload(file);
		if (this.report) {
			this.reportReload(file);
		}
	}},

	{ name: 'watch', impl: function (file, stats) {
		if (!this.watch) {
			console.reportWarn(`${this.constructor.name} tried ot watch "${file}" but watch is set to false`);
			return;
		}
		if (this.watched.has(file)) {
			console.reportWarn(`${this.constructor.name} tried ot watch "${file}" but it's already being watched`);
			return;
		}
		console.assert(this.watcher, '');
		this.watcher.add(file);
		this.watched.add(file);
		this._watch(file);
		if (this.report) {
			this.reportWatch(file);
		}
	}},

	{ name: 'unwatch', impl: function (file, stats) {
		if (!this.watch) {
			console.reportWarn(`${this.constructor.name} tried ot unwatch "${file}" but watch is set to false`);
			return;
		}
		if (!this.watched.has(file)) {
			console.reportWarn(`${this.constructor.name} tried to unwatch "${file}" but it's already not being watched`);
			return;
		}
		console.assert(this.watcher, '');
		this.watcher.unwatch(file);
		this.watched.delete(file);
		if (this.report) {
			this.reportUnwatch(file);
		}
	}},

	// Folder operations

	{ name: 'loadFolder', impl: function (folder) { walkDirSync(folder, file => this.load(file)); }},
	{ name: 'unloadFolder', impl: function (folder) { walkDirSync(folder, file => this.unload(file)); }},
	{ name: 'reloadFolder', impl: function (folder) { walkDirSync(folder, file => this.reload(file)); }},
	{ name: 'watchFolder', impl: function (folder) { walkDirSync(folder, file => this.watch(file)); }},
	{ name: 'unwatchFolder', impl: function (folder) { walkDirSync(folder, file => this.unwatch(file)); }},

	// Bulk operations

	{ name: 'loadAll', impl: function () { this.paths.forEach(this.load.bind(this)); }},
	{ name: 'unloadAll', impl: function () { this.paths.forEach(this.unload.bind(this)); }},
	{ name: 'reloadAll', impl: function () { this.paths.forEach(this.reload.bind(this)); }},
	{ name: 'watchAll', impl: function () { this.paths.forEach(this.watch.bind(this)); }},
	{ name: 'unwatchAll', impl: function () { this.paths.forEach(this.unwatch.bind(this)); }},

	// Chokidar

	{ name: 'onAdd', impl: function (file) { this.load(file); }},
	{ name: 'onChange', impl: function (file) { this.reload(file); }},
	{ name: 'onUnlink', impl: function (file) { this.unload(file); }},
	{ name: 'onAddDir', impl: function (folder) { this.loadFolder(folder); }},
	{ name: 'onUnlinkDir', impl: function (folder) { this.unloadFolder(folder); }},

	// Some utils

	{ name: 'isFile', impl: function (file) {
		try {
			return fs.statSync(file).isFile();
		} catch (err) {
			console.reportError(`Error checking if path '"${file}"' is a file`, err);
			return false;
		}
	}},

	{ name: 'isDirectory', impl: function (file) {
		try {
			return fs.statSync(file).isDirectory();
		} catch (err) {
			console.reportError(`Error checking if path '"${file}"' is a directory`, err);
			return false;
		}
	}},

	// How to format file for reporting
	
	{ name: 'formatFile', impl: function (file) {
		return this.fileToKey(file);
	}},

	// Self explanatory, these will be called at the end of each operation if this.report is true
	
	{ name: 'reportLoad', impl: function (file) { console.report(`${this.formatFile(file)} loaded`); }},
	{ name: 'reportUnload', impl: function (file) { console.report(`${this.formatFile(file)} unloaded`); }},
	{ name: 'reportReload', impl: function (file) { console.report(`${this.formatFile(file)} reloaded`); }},
	{ name: 'reportWatch', impl: function (file) { console.report(`Watching ${this.formatFile(file)}...`); }},
	{ name: 'reportUnwatch', impl: function (file) { console.report(`Stopped watching ${this.formatFile(file)}`); }},
]);

Object.defineProperty(module, 'FilesManager', { writable: false, enumerable: true, configurable: false });

module.exports = {
	FilesManager: module.FilesManager
};
