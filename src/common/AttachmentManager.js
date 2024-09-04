//@ts-check
'use-strict'
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const sanitizeFilename = require('sanitize-filename');

class AttachmentManager {
    constructor(client) {
        this.client = client || global.client
        this.attachmentsFile = path.join(__dirname, 'attachments.json');
    }

    /**
     * Charge les attachments depuis le fichier JSON.
     * @returns {Array} - Une liste des attachments.
     */
    loadAttachments() {
        try {
            const data = fs.readFileSync(this.attachmentsFile);
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    /**
     * Sauvegarde les attachments dans le fichier JSON.
     * @param {Array} attachments - La liste des attachments à sauvegarder.
     */
    saveAttachments(attachments) {
        fs.writeFileSync(this.attachmentsFile, JSON.stringify(attachments, null, 2));
    }

    /**
     * Extrait le nom du fichier depuis une URL.
     * @param {string} url - L'URL d'où extraire le nom du fichier.
     * @returns {string} - Le nom du fichier.
     */
    extractFilenameFromUrl(url) {
        const parsedUrl = new URL(url);
        const pathname = parsedUrl.pathname;
        const filename = path.basename(pathname);
        return sanitizeFilename(filename);
    }

    /**
     * Télécharge un fichier depuis une URL et le sauvegarde localement.
     * @param {string} url - L'URL du fichier à télécharger.
     * @param {string} filename - Le nom de fichier sous lequel sauvegarder le fichier.
     * @returns {Promise<string>} - Le chemin vers le fichier téléchargé.
     */
    async downloadFile(url, filename) {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
        });

        const filePath = path.join(__dirname, 'downloads', filename);
        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(filePath));
            writer.on('error', reject);
        });
    }

    /**
     * Gère les attachments d'un message Discord.
     * @param {Object} message - Le message Discord contenant les attachments.
     * @returns {Promise<object>} attachments
     */
    async handleAttachments(message) {
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
                    username: message.author.username
                };

                attachments.push(attachmentInfo);
            }
            this.saveAttachments(attachments);
            return attachments
        }

       
    }

    /**
     * Récupère les attachments associés à un message donné.
     * @param {string} messageId - L'ID du message dont on veut récupérer les attachments.
     * @returns {Array} - Une liste des attachments associés au message.
     */
    getAttachments(messageId) {
        const attachments = this.loadAttachments();
        return attachments.filter(att => att.messageId === messageId);
    }
}

module.exports = AttachmentManager;