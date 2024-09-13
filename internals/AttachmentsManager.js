'use strict';

const { __cfn, __cf } = eval(require(`current_filename`));
const { report, reportWarn, reportError } = console.createReports(__cfn);

const fs = require('fs');
const path = require('path');
const sanitizeFilename = require('sanitize-filename');
const { downloadFile } = require(global.utilsPath);

class AttachmentsManager {
    constructor() {
        this.filesPath = `${global.projectRoot}/src/files`;
        this.indexFilename = 'attachmentsIndex.json';
        this.downloadsPath = path.join(this.filesPath, 'downloads');
        this.indexPath = path.join(this.filesPath, this.indexFilename);
    }

    loadIndex() {
        const functionName = 'loadIndex';
        try {
            this.index = JSON.parse(fs.readFileSync(this.indexPath, 'utf8'));
        } catch (err) {
            reportError(__line, functionName, `Error loading ${this.indexFilename}:`, err);
        }
    }

    saveIndex() {
        const functionName = 'saveIndex';
        try {
            fs.writeFileSync(this.indexPath, JSON.stringify(this.index, null, 4), 'utf8');
        } catch (err) {
            reportError(__line, functionName, `Error saving ${this.indexFilename}:`, err);
        }
    }

    #extractFilenameFromUrl(url) {
        const functionName = 'extractFilenameFromUrl';
        try {
            const parsedUrl = new URL(url);
            const pathname = parsedUrl.pathname;
            const filename = path.basename(pathname);
            return sanitizeFilename(filename);
        } catch (err) {
            reportError(__line, functionName, `Error extracting filename from ${global.colors.FgYellow}${url}${global.colors.Reset}:`, err);
            return 'unknown';
        }
    }

    saveAttachments(message) {
        const functionName = 'saveAttachments';
        try {
            if (!message.attachments || message.attachments.size === 0) return;
            for (const attachment of message.attachments.values()) {
                const url = attachment.url;
                const originalFilename = this.#extractFilenameFromUrl(url);
                const filename = `${message.channel.id}.${message.id}.${originalFilename}.${path.extname(originalFilename)}`;
                downloadFile(url, path.join(this.downloadsPath, filename));
                this.index.push({
                    type: attachment.contentType ? attachment.contentType.split('/')[0] : 'file',
                    filename: filename,
                    url: url,
                    authorId: message.author.id
                });
            }
        } catch (err) {
            reportError(__line, functionName, err);
        }
    }

    getAttachments(messageId) {
        const functionName = 'getAttachments';
        try {
            for (const entry of this.index) {
                if (entry.messageId === messageId) return entry;
            }
            return null;
        } catch (err) {
            reportError(__line, functionName, err);
            return [];
        }
    }
}

module.exports = AttachmentsManager;
