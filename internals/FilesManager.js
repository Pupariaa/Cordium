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

function construct(files, shouldWatch, watchOptions) {
	this.loaded = new Map(); // currently loaded files, it maps files to their loaded value
	this.watched = new Set(); // actively watched files
	this.files = files ?? []; // files to take action on if a XAll method is called
	this.shouldWatch = (shouldWatch ?? global.dev) ?? true; // starts or closes the watcher automatically accordingly
	this.watchOptions = watchOptions ?? defaultWatchOptions; // updates the watcher if the options are changed
	this.queue = [];
	this.processingPromise = Promise.resolve();
}

set(module, 'FilesManager', undefined, true, true, true);

function setWatcher(valueKey, newWatcher) {
	this[valueKey] = newWatcher;
	this.watcher.on('add', this.onAdd.bind(this));
	this.watcher.on('change', this.onChange.bind(this));
	this.watcher.on('unlink', this.onUnlink.bind(this));
	this.watcher.on('addDir', this.onAddDir.bind(this));
	this.watcher.on('unlinkDir', this.onUnlinkDir.bind(this));
}

function setShouldWatch(valueKey, value) {
	if (value === this.shouldWatch) {
		return;
	}

	if (value === false) {
		if (this.watcher) {
			this.watcher.close();
			this.watcher = null;
			this.watched = [];
		}
	} else if (value === true && !this.watcher) {
		this.watcher = chokidar.watch([], this.watchOptions);
	}

	this[valueKey] = value;
}

function setWatchOptions(valueKey, newWatchOptions) {
	if (newWatchOptions === this.watchOptions) {
		return;
	}
	this[valueKey] = { ...this.watchOptions, ...newWatchOptions };
	if (!this.shouldWatch) {
		return;
	}
	if (this.watcher) {
		this.watcher.close();
	}
	this.watcher = chokidar.watch([...this.watched], this.watchOptions);
}

module.FilesManager = abstractClassBuilder('FilesManager', construct,
	[
		// { name: 'watcher', setter: setWatcher, isPrivate: true },
		// { name: 'shouldWatch', setter: setShouldWatch, isProtected: true },
		// { name: 'watchOptions', setter: setWatchOptions, isProtected: true }
		{ name: 'watcher', setter: setWatcher },
		{ name: 'shouldWatch', setter: setShouldWatch },
		{ name: 'watchOptions', setter: setWatchOptions }
	],
	[
		// How to format file for keys in loaded / reporting
		// fileToKey must be able to pull out a key from the file itself, not its loaded content

		{ name: 'fileToKey', impl: function (file) { return path.basename(file, '.js'); } },
		{ name: 'formatFile', impl: function (file) { return this.fileToKey(file); } },

		// callback called after the corresponding operation is done

		// What loading and unloading a file means
		// The return value of _load will be the value assigned in this.load at the corresponding key

		{ name: '_load', mandatory: true }, { name: '_unload', mandatory: true },

		// reload will simply call unload then load then _reload for optinal additional behavior
		// watch and unwatch should not need any additional behavior

		{ name: '_reload' },

		// Updates this.files

		{ name: 'add', impl: function (file, stats) { this.files.includes(file) ? console.reportWarn(`'"${file}"' is already in the managed files`) : this.files.push(file); } },
		{ name: 'addFolder', impl: async function addFolder(file) { walkDirSync(file, this.add.bind(this)); } },
		{ name: 'remove', impl: function (file, stats) { if (!this.files.remove(file)) { console.reportWarn(`'"${file}"' is already not in the managed files`); } } },
		{ name: 'removeFolder', impl: async function (file) { walkDirSync(file, this.remove.bind(this)); } },

		// Queue management

		{
			name: 'enqueueTask', impl: async function (task) {
				await this.processingPromise;
				this.queue.push(task);
				this.processingPromise = this.processQueue();
				return this.processingPromise;
			}
		},

		{
			name: 'processQueue', impl: async function () {
				while (this.queue.length > 0) {
					await (this.queue.shift())();
				}
			}
		},

		// File operations

		{
			name: 'load', impl: async function (file, reloading = false) {
				let ret;
				await this.enqueueTask(async () => {
					const fileKey = this.fileToKey(file);
					if (this.loaded.has(fileKey)) {
						console.reportWarn(`${this.constructor.name} tried to load "${file}" but it's already loaded`);
						ret = [ true, this.loaded.get(fileKey) ];
						return;
					}
					const [success, content] = await this._load(file, reloading);
					if (!success) {
						ret = [ false, null ];
						return;
					}
					this.loaded.set(fileKey, content);
					if (!reloading) {
						this.reportLoad(file);
					}
					ret = [ true, content ];
				});
				return ret;
			}
		},

		{
			name: 'unload', impl: function (file, reloading = false) {
				return this.enqueueTask(async () => {
					const fileKey = this.fileToKey(file);
					if (!this.loaded.has(fileKey)) {
						console.reportWarn(`${this.constructor.name} tried to unload "${file}" but it's already unloaded or has never been`);
						return;
					}
					const content = this.loaded.get(fileKey);
					await this._unload(file, content, reloading);
					this.loaded.delete(fileKey);
					if (!reloading) {
						this.reportUnload(file);
					}
				});
			}
		},

		{
			name: 'reload', impl: function (file) {
				return this.enqueueTask(async () => {
					await this.unload(file, true);
					const [ success, content ] = await this.load(file, true);
					if (success) {
						await this._reload(file, content);
						this.reportReload(file);
					} else {
						console.reportWarn(`${this.constructor.name} tred to reload "${file}" but load has failed`);
					}
				});
			}
		},

		{
			name: 'watch', impl: function (file) {
				if (!this.shouldWatch) {
					console.reportWarn(`${this.constructor.name} tried to watch "${file}" but shouldWatch is set to false`);
					return;
				}
				if (this.watched.has(file)) {
					console.reportWarn(`${this.constructor.name} tried to watch "${file}" but it's already being watched`);
					return;
				}
				console.assert(this.watcher, '');
				this.watcher.add(file);
				this.watched.add(file);
				this.reportWatch(file);
			}
		},

		{
			name: 'unwatch', impl: function (file) {
				if (!this.shouldWatch) {
					console.reportWarn(`${this.constructor.name} tried to unwatch "${file}" but shouldWatch is set to false`);
					return;
				}
				if (!this.watched.has(file)) {
					console.reportWarn(`${this.constructor.name} tried to unwatch "${file}" but it's already not being watched`);
					return;
				}
				console.assert(this.watcher, '');
				this.watcher.unwatch(file);
				this.watched.delete(file);
				this.reportUnwatch(file);
			}
		},

		// Folder operations

		{ name: 'loadFolder', impl: function (folder) { return walkDirAsync(folder, this.load.bind(this)); } },
		{ name: 'unloadFolder', impl: function (folder) { return walkDirAsync(folder, this.unload.bind(this)); } },
		{ name: 'reloadFolder', impl: function (folder) { return walkDirAsync(folder, this.reload.bind(this)); } },
		{ name: 'watchFolder', impl: function (folder) { walkDirSync(folder, this.watch.bind(this)); } },
		{ name: 'unwatchFolder', impl: function (folder) { walkDirSync(folder, this.unwatch.bind(this)); } },

		// Bulk operations

		{ name: 'loadAll', impl: function () { return Promise.all(this.files.map(this.load.bind(this))); } },
		{ name: 'unloadAll', impl: function () { return Promise.all(this.files.map(this.unload.bind(this))); } },
		{ name: 'reloadAll', impl: function () { return Promise.all(this.files.map(this.reload.bind(this))); } },
		{ name: 'watchAll', impl: function () { this.files.forEach(this.watch.bind(this)); } },
		{ name: 'unwatchAll', impl: function () { this.files.forEach(this.unwatch.bind(this)); } },

		// Chokidar

		{ name: 'onAdd', impl: function (file) { return this.load(file); } },
		{ name: 'onChange', impl: function (file) { return this.reload(file); } },
		{ name: 'onUnlink', impl: function (file) { return this.unload(file); } },
		{ name: 'onAddDir', impl: function (folder) { return this.loadFolder(folder); } },
		{ name: 'onUnlinkDir', impl: function (folder) { return this.unloadFolder(folder); } },

		// Some utils

		{
			name: 'isFile', impl: function (file) {
				try {
					return fs.statSync(file).isFile();
				} catch (err) {
					console.reportError(`Error checking if path "${file}" is a file`, err);
					return false;
				}
			}
		},

		{
			name: 'isDirectory', impl: function (file) {
				try {
					return fs.statSync(file).isDirectory();
				} catch (err) {
					console.reportError(`Error checking if path "${file}" is a directory`, err);
					return false;
				}
			}
		},

		// Self explanatory, these will be called at the end of each operation if this.report is true

		{ name: 'reportLoad', impl: function (file) { console.report(`${this.formatFile(file)} loaded`); } },
		{ name: 'reportUnload', impl: function (file) { console.report(`${this.formatFile(file)} unloaded`); } },
		{ name: 'reportReload', impl: function (file) { console.report(`${this.formatFile(file)} reloaded`); } },
		{ name: 'reportWatch', impl: function (file) { console.report(`Watching ${file}...`); } },
		{ name: 'reportUnwatch', impl: function (file) { console.report(`Stopped watching ${file}`); } },
	]);

Object.defineProperty(module, 'FilesManager', { writable: false, enumerable: true, configurable: false });

module.exports = {
	FilesManager: module.FilesManager
};
