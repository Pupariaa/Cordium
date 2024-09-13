'use strict';

const { __cfn, __cf } = eval(require(`current_filename`));
const { report, reportWarn, reportError } = console.createReports(__cfn);

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const sanitizeFilename = require('sanitize-filename');
const { downloadFile } = require(global.utilsPath);

class AttachmentManager {
    constructor() {
        this.attachmentsFiles = './attachmentsFiles';
    }

    loadAttachments() {
        const functionName = 'loadAttachments';
        try {
            const data = fs.readFileSync(path.join(this.attachmentsFiles, 'index.json'), 'utf8');
            return JSON.parse(data);
        } catch (err) {
            reportError(__line, functionName, `Error loading attachments:`, err);
        }
        return [];
    }

    saveAttachments(attachments) {
        const functionName = 'saveAttachments';
        try {
            fs.writeFileSync(
                path.join(this.attachmentsFiles, 'index.json'),
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
            reportError(__line, functionName, `Error extracting filename from ${global.colors.FgYellow}${url}${global.colors.Reset}:`, err);
            return 'unknown';
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
                    const filePath = downloadFile(attachment.url, path.join(this.attachmentsFiles, uniqueId));

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
            }

            return newAttachments;
        } catch (err) {
            reportError(__line, functionName, err);
        }
    }

    getAttachments(messageId) {
        const functionName = 'getAttachments';
        try {
            const attachments = this.loadAttachments();
            const filteredAttachments = attachments.filter(att => att.messageId === messageId);
            return filteredAttachments;
        } catch (err) {
            reportError(__line, functionName, err);
            return [];
        }
    }
}

module.exports = AttachmentManager;
