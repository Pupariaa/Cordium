const path = require('path');
const ParamCaretaker = require(path.join(__dirname, '../../../../internals/api/modules/ParamCaretaker'));

const getMessageDetails = async (messageId) => {
    try {
        // 1. Chercher le message dans la table `MessageCreate`
        const message = await global.database.EVENTS_messageCreate.findOne({
            where: { messageId },
        });

        if (!message) {
            return { error: "Message not found", status_code: 404 };
        }

        // Construire l'objet de réponse initial
        const messageDetails = {
            messageId: message.messageId,
            authorId: message.userId,
            createdAt: message.datetime,
            channelId: message.channelId,
            content: message.content,
            attachments: message.attachments || [],
            replies: [],
            reactions: [],
            deletedAt: null
        };

        // 2. Vérifier si le message est supprimé dans la table `MessageDelete`
        const messageDeleted = await global.database.EVENTS_messageDelete.findOne({
            where: { messageId },
        });
        if (messageDeleted) {
            messageDetails.deletedAt =messageDeleted.datetime;
        }

        // 3. Chercher les réponses (replies) au message dans `MessageCreate`
        const replies = await global.database.EVENTS_messageCreate.findAll({
            where: { replyToMessageId: messageId },
        });

        // Construire le tableau des réponses
        messageDetails.replies = replies.map((reply) => ({
            messageId: reply.messageId,
            authorId: reply.userId,
            createdAt: reply.datetime,
            content: reply.content,
            attachments: reply.attachments || [],
        }));

        // 4. Chercher les réactions dans `MessageReactionAdd`
        const reactions = await global.database.EVENTS_messageReactionAdd.findAll({
            where: { messageId },
        });

        // Construire le tableau des réactions
        for (const reaction of reactions) {
            // Vérifier si la réaction a été supprimée dans `MessageReactionRemove`
            const reactionRemoved = await global.database.EVENTS_messageReactionRemove.findOne({
                where: {
                    reactionId: reaction.reactionId,
                    messageId: reaction.messageId,
                    userId: reaction.userId,
                },
            });

            messageDetails.reactions.push({
                reactionId: reaction.reactionId,
                reactBy: reaction.userId,
                reactAt: reaction.datetime,
                unreactAt: reactionRemoved ? reactionRemoved.datetime : null,
                name: reaction.name
            });
        }

        return messageDetails;

    } catch (error) {
        console.error("Erreur lors de la récupération des détails du message:", error);
        return { error: "Internal Server Error", status_code: 500 };
    }
};


module.exports = {
    /**
     * @description Return the history of voice connections for a specific user
     * @param {object} ep - The endpoint object
     * @param {object} requestData - The request data object
     * @param {string} requestData.key - The API key
     * @param {string} requestData.userid - The user id
     * @returns {Promise<object[]>} - The voice connection updates
     */
    handleRequest: async (ep, requestData) => {
        const params = new ParamCaretaker();
        const validationError = params.validate(ep, requestData);
        if (requestData.key !== "bAhRTVpaXS4FvEeD9k2KLOI6Ho92MReU" || !requestData.key) {
            return { error: 'Unauthorized', status_code: 401 }
        }
        if (validationError) {
            return validationError;
        }

        const messageData = await getMessageDetails(requestData.id);

        return messageData

    },
};

