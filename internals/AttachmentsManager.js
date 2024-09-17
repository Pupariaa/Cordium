'use strict';

const fs = require('fs');
const path = require('path');
const sanitizeFilename = require('sanitize-filename');

const { config: { colors } } = require('extend-console');
const { downloadFile } = require(global.utilsPath);

class AttachmentsManager {
    filesPath = path.join(global.projectRoot, 'src', 'files');
    indexFilename = 'attachmentsIndex.json';
    constructor(
        indexPath = path.join(global.projectRoot, 'src', 'files', this.indexFilename)
    ) {
        this.indexPath = indexPath;
        this.downloadsPath = path.join(this.filesPath, 'downloads');
        global.sigintSubscribers.push(this.saveIndex.bind(this));
        if (!fs.existsSync(this.filesPath)) fs.mkdirSync(this.filesPath);
        console.report(`${this.indexFilename} path set to:`, indexPath);
    }

    loadIndex() {
        try {
            if (fs.existsSync(this.indexPath)) {
                this.index = JSON.parse(fs.readFileSync(this.indexPath, 'utf8'));
            } else {
                this.index = {};
            }
        } catch (err) {
            console.reportError(`Error loading ${this.indexFilename}:`, err);
        }
    }

    saveIndex() {
        try {
            const stringifiedIndex = JSON.stringify(this.index, null, 4);
            if (stringifiedIndex) {
                fs.writeFileSync(this.indexPath, stringifiedIndex, 'utf8');
                console.report(`Saved ${this.indexFilename}`);
            }
        } catch (err) {
            console.reportError(`Error saving ${this.indexFilename}:`, err);
        }
    }

    #extractFilenameFromUrl(url) {
        try {
            const parsedUrl = new URL(url);
            const pathname = parsedUrl.pathname;
            const filename = path.basename(pathname);
            return sanitizeFilename(filename);
        } catch (err) {
            console.reportError(`Error extracting filename from ${colors.FgYellow}${url}${colors.Reset}:`, err);
            return 'unknown';
        }
    }

    saveAttachments(message) {
        try {
            if (!message.attachments || message.attachments.size === 0) return;
            for (const attachment of message.attachments.values()) {
                const url = attachment.url;
                const originalFilename = this.#extractFilenameFromUrl(url);
                const filename = `${message.channel.id}.${message.id}.${originalFilename}.${path.extname(originalFilename)}`;
                downloadFile(url, path.join(this.downloadsPath, filename));
                this.index[message.id] = {
                    type: attachment.contentType ? attachment.contentType.split('/')[0] : 'file',
                    filename: filename,
                    url: url,
                    authorId: message.author.id
                };
            }
        } catch (err) {
            console.reportError(err);
        }
    }

    getAttachments(messageId) {
        try {
            return this.index[messageId];
        } catch (err) {
            console.reportError(err);
            return [];
        }
    }
}

module.exports = AttachmentsManager;
