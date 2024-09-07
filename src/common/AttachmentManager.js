//@ts-check
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
        this.attachmentsFile = path.join(__dirname, 'attachments.json');
    }

    /**
     * Loads attachments from a JSON file.
     * @returns {Array} - A list of attachments.
     */
    loadAttachments() {
        try {
            const data = fs.readFileSync(this.attachmentsFile, 'utf8');
            console.info(`${__filename} - Line ${__line} (loadAttachments): Loaded attachments successfully.`);
            return JSON.parse(data);
        } catch (error) {
            console.error(`${__filename} - Line ${__line} (loadAttachments): Error loading attachments.`, error);
            return [];
        }
    }

    /**
     * Saves attachments to a JSON file.
     * @param {Array} attachments - The list of attachments to save.
     */
    saveAttachments(attachments) {
        try {
            fs.writeFileSync(this.attachmentsFile, JSON.stringify(attachments, null, 2));
            console.info(`${__filename} - Line ${__line} (saveAttachments): Attachments saved successfully.`);
        } catch (error) {
            console.error(`${__filename} - Line ${__line} (saveAttachments): Error saving attachments.`, error);
        }
    }

    /**
     * Extracts the filename from a URL.
     * @param {string} url - The URL to extract the filename from.
     * @returns {string} - The extracted and sanitized filename.
     */
    extractFilenameFromUrl(url) {
        try {
            const parsedUrl = new URL(url);
            const pathname = parsedUrl.pathname;
            const filename = path.basename(pathname);
            console.info(`${__filename} - Line ${__line} (extractFilenameFromUrl): Filename extracted successfully.`);
            return sanitizeFilename(filename);
        } catch (error) {
            console.error(`${__filename} - Line ${__line} (extractFilenameFromUrl): Error extracting filename.`, error);
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
        try {
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'stream',
            });

            const filePath = path.join(__dirname, 'downloads', filename);
            const writer = fs.createWriteStream(filePath);

            response.data.pipe(writer);

            console.info(`${__filename} - Line ${__line} (downloadFile): Download started for ${filename}.`);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    console.info(`${__filename} - Line ${__line} (downloadFile): Download completed for ${filename}.`);
                    resolve(filePath);
                });
                writer.on('error', (error) => {
                    console.error(`${__filename} - Line ${__line} (downloadFile): Error during download.`, error);
                    reject(error);
                });
            });
        } catch (error) {
            console.error(`${__filename} - Line ${__line} (downloadFile): Error initiating download.`, error);
            throw error;
        }
    }

    /**
     * Handles attachments from a Discord message.
     * @param {Object} message - The Discord message containing attachments.
     * @returns {Promise<Array>} - A list of attachments processed.
     */
    async handleAttachments(message) {
        try {
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
                }
                this.saveAttachments(attachments);
                console.info(`${__filename} - Line ${__line} (handleAttachments): Attachments handled successfully.`);
                return attachments;
            } else {
                console.info(`${__filename} - Line ${__line} (handleAttachments): No attachments found in message.`);
                return [];
            }
        } catch (error) {
            console.error(`${__filename} - Line ${__line} (handleAttachments): Error handling attachments.`, error);
            throw error;
        }
    }

    /**
     * Retrieves attachments associated with a given message.
     * @param {string} messageId - The ID of the message to retrieve attachments for.
     * @returns {Array} - A list of attachments associated with the message.
     */
    getAttachments(messageId) {
        try {
            const attachments = this.loadAttachments();
            const filteredAttachments = attachments.filter(att => att.messageId === messageId);
            console.info(`${__filename} - Line ${__line} (getAttachments): Attachments retrieved successfully for message ID ${messageId}.`);
            return filteredAttachments;
        } catch (error) {
            console.error(`${__filename} - Line ${__line} (getAttachments): Error retrieving attachments.`, error);
            return [];
        }
    }
}

module.exports = AttachmentManager;
