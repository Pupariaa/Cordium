'use strict';
require('puparia.getlines.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const sanitizeFilename = require('sanitize-filename');

/**
 * AttachmentManager class handles the management of attachments in a Discord bot.
 */
class AttachmentManager {
    constructor() {
        this.client = global.client;
        this.attachmentsFile = path.join(__dirname, '../src/files/');
        console.log(__dirname);
    }

    /**
     * Loads attachments from a JSON file.
     * @returns {Array} - A list of attachments.
     */
    loadAttachments() {
        const functionName = 'loadAttachments';
        try {
            const data = fs.readFileSync(path.join(this.attachmentsFile, 'index.json'), 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`${__filename} - (${functionName}): Error loading attachments.`, error);
            return [];
        }
    }

    /**
     * Saves attachments to a JSON file.
     * @param {Array} attachments - The list of attachments to save.
     */
    saveAttachments(attachments) {
        const functionName = 'saveAttachments';
        try {
            fs.writeFileSync(
                path.join(this.attachmentsFile, 'index.json'),
                JSON.stringify(attachments, null, 2)
            );
        } catch (error) {
            console.error(`${__filename} - (${functionName}): Error saving attachments.`, error);
        }
    }

    /**
     * Extracts the filename from a URL.
     * @param {string} url - The URL to extract the filename from.
     * @returns {string} - The extracted and sanitized filename.
     */
    extractFilenameFromUrl(url) {
        const functionName = 'extractFilenameFromUrl';
        try {
            const parsedUrl = new URL(url);
            const pathname = parsedUrl.pathname;
            const filename = path.basename(pathname);
            return sanitizeFilename(filename);
        } catch (error) {
            console.error(`${__filename} - (${functionName}): Error extracting filename.`, error);
            return 'unknown';
        }
    }

    /**
     * Downloads a file from a URL and saves it locally.
     * @param {string} url - The URL of the file to download.
     * @param {string} filename - The filename to save the downloaded file as.
     * @returns {Promise<string>} - The path to the downloaded file.
     */
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
                writer.on('error', (error) => {
                    console.error(`${__filename} - (${functionName}): Error during download.`, error);
                    reject(error);
                });
            });
        } catch (error) {
            console.error(`${__filename} - (${functionName}): Error initiating download.`, error);
            throw error;
        }
    }

    /**
 * Handles attachments from a Discord message.
 * @param {Object} message - The Discord message containing attachments.
 * @returns {Promise<Array>} - A list of newly processed attachments.
 */
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

        } catch (error) {
            console.error(`${__filename} - (${functionName}): Error handling attachments.`, error);
            throw error;
        }
    }
    /**
     * Retrieves attachments associated with a given message.
     * @param {string} messageId - The ID of the message to retrieve attachments for.
     * @returns {Array} - A list of attachments associated with the message.
     */
    getAttachments(messageId) {
        const functionName = 'getAttachments';
        try {
            const attachments = this.loadAttachments();
            const filteredAttachments = attachments.filter(att => att.messageId === messageId);
            return filteredAttachments;
        } catch (error) {
            console.error(`${__filename} - (${functionName}): Error retrieving attachments.`, error);
            return [];
        }
    }
}

module.exports = AttachmentManager;
