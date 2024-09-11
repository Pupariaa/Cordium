'use strict';
require('puparia.getlines.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const sanitizeFilename = require('sanitize-filename');

const report = console.createReportFunction(__filename);
const reportError = console.createReportErrorFunction(__filename);

class AttachmentManager {
    constructor() {
        this.client = global.client;
        this.attachmentsFile = path.join(__dirname, '../src/files/');
    }

    loadAttachments() {
        const functionName = 'loadAttachments';
        try {
            const data = fs.readFileSync(path.join(this.attachmentsFile, 'index.json'), 'utf8');
            return JSON.parse(data);
        } catch (err) {
            reportError(__line, functionName, `Error loading attachments:`, err);
            return [];
        }
    }

    saveAttachments(attachments) {
        const functionName = 'saveAttachments';
        try {
            fs.writeFileSync(
                path.join(this.attachmentsFile, 'index.json'),
                JSON.stringify(attachments, null, 2)
            );
        } catch (err) {
            reportError(__line, functionName, `Error saving attachments:`, err);
        }
    }

    extractFilenameFromUrl(url) {
        const functionName = 'extractFilenameFromUrl';
        try {
            const parsedUrl = new URL(url);
            const pathname = parsedUrl.pathname;
            const filename = path.basename(pathname);
            return sanitizeFilename(filename);
        } catch (err) {
            reportError(__line, functionName, `Error extracting filename from ${url}:`, err);
            return 'unknown';
        }
    }

    async downloadFile(url, filename) {
        const functionName = 'downloadFile';
        try {
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'stream',
            });

            const filePath = path.join(this.attachmentsFile, 'downloads', filename);
            const writer = fs.createWriteStream(filePath);

            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    resolve(filePath);
                });
                writer.on('error', (err) => {
                    reportError(__line, functionName, `Error during download ${url}:`, err);
                    reject(err);
                });
            });
        } catch (err) {
            reportError(__line, functionName, `Error initiating download of ${url}:`, err);
            throw error;
        }
    }

    async handleAttachments(message) {
        const functionName = 'handleAttachments';
        try {
            const newAttachments = [];

            if (message.attachments.size > 0) {
                const attachments = this.loadAttachments();

                for (const attachment of message.attachments.values()) {
                    const originalFilename = this.extractFilenameFromUrl(attachment.url);
                    const uniqueId = uuidv4() + path.extname(originalFilename);
                    const filePath = await this.downloadFile(attachment.url, uniqueId);

                    const attachmentInfo = {
                        type: attachment.contentType ? attachment.contentType.split('/')[0] : 'file',
                        channelId: message.channel.id,
                        messageId: message.id,
                        filename: uniqueId,
                        originalFilename: originalFilename,
                        url: filePath,
                        userid: message.author.id,
                        username: message.author.username,
                    };

                    attachments.push(attachmentInfo);
                    newAttachments.push(attachmentInfo);
                }

                this.saveAttachments(attachments);
            } else {
            }

            return newAttachments;

        } catch (err) {
            reportError(__line, functionName, `Error handling attachments:`, err);
            throw error;
        }
    }

    getAttachments(messageId) {
        const functionName = 'getAttachments';
        try {
            const attachments = this.loadAttachments();
            const filteredAttachments = attachments.filter(att => att.messageId === messageId);
            return filteredAttachments;
        } catch (err) {
            reportError(__line, functionName, `Error retrieving attachments:`, err);
            return [];
        }
    }
}

module.exports = AttachmentManager;
