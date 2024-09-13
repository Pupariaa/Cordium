
/**
 * Process a list of voice state updates and returns an array of voice connection status objects.
 * Each object contains the user ID, the datetime of the connection, the datetime of the disconnection,
 * the executor ID of the disconnection (if any), a boolean indicating if the user is still connected,
 * an array of events (channel changes, state changes), an array of messages exchanged during the connection
 * and the IDs of the channels the user was connected to.
 * @param {Array<Object>} voiceUpdates - A list of voice state updates.
 * @returns {Promise<Array<Object>>} - An array of voice connection status objects.
 */

async function getVoiceConnectionStatusWithEvents(voiceUpdates) {

    const filteredUpdates = voiceUpdates.filter(event => [1, 2, 3, 4].includes(event.eventType));
    filteredUpdates.sort((a, b) => a.datetime - b.datetime);
  
    const results = [];
    const connectEvents = {};
  
    for (const event of filteredUpdates) {
      const userId = event.userId;
  
      if (event.eventType === 1) {
        connectEvents[userId] = {
          userId: userId,
          connectedTimestamp: event.datetime,
          connectedAt: function (utcOffset = 0, locale = 'en') {
            if (!event.datetime) return null;
            return new Date(event.datetime + utcOffset * 3600 * 1000).toLocaleString(locale, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
          },
          disconnectTimestamp : null,
          disconnectedAt: null,
          disconnectBy: null,
          stillConnected: true,
          events: [],
          messages: [],
          connectedChannelId: event.newChannelId,
          disconnectedChannelId: null
        };
  
      } else if (event.eventType === 3) {
        if (connectEvents[userId]) {
          connectEvents[userId].disconnectTimestamp = event.datetime,
          connectEvents[userId].disconnectedAt = function (utcOffset = 0, locale = 'en') {
            if (!event.datetime) return null;
            return new Date(this.disconnectTimestamp + utcOffset * 3600 * 1000).toLocaleString(locale, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
          },
          connectEvents[userId].disconnectBy = event.executorId;
          connectEvents[userId].stillConnected = false;
          connectEvents[userId].disconnectedChannelId = event.oldChannelId;
  
          const { connectedChannelId, disconnectedChannelId } = connectEvents[userId];
          const channelIds = [connectedChannelId];
  
          if (disconnectedChannelId && disconnectedChannelId !== connectedChannelId) {
            channelIds.push(disconnectedChannelId);
          }
  
          report(__line, functionName, `Canaux pour l'utilisateur ${userId}:`, channelIds)

  
          if (channelIds.length > 0) {
            const messages = await global.eventsDatabase.getMessagesBetweenDates(
              userId,
              connectEvents[userId].connectedTimestamp,
              connectEvents[userId].disconnectTimestamp || Date.now(),
              channelIds
            );
            connectEvents[userId].messages = messages;
          }
  
          results.push(connectEvents[userId]);
  
          delete connectEvents[userId];
        }
      } else if (event.eventType === 2) {
  
        if (event.oldChannelId && event.newChannelId && event.oldChannelId !== event.newChannelId) {
          if (connectEvents[userId]) {
            connectEvents[userId].events.push({
              datetime: event.datetime,
              eventName: 'channelChange',
              stats: event.newChannelId
            });
          }
        }
      } else if (event.eventType === 4) {
        if (connectEvents[userId]) {
          addEventChanges(connectEvents[userId].events, event);
        }
      }
    }
  
  
    for (const session of Object.values(connectEvents)) {
      const { connectedChannelId } = session;
      const channelIds = [connectedChannelId];
      if (channelIds.length > 0) {
        const messages = await global.eventsDatabase.getMessagesBetweenDates(
          session.userId,
          session.connectAt,
          Date.now(),
          channelIds
        );
        session.messages = messages;
      }
  
      results.push(session);
    }
  
    return results;
  }

/**
 * Adds events to the given events list based on the differences between the old and new values in the given event.
 * The added events are serverMute, serverDeaf, selfStream, selfCam, clientMute and clientDeaf.
 * @param {Array<Object>} eventsList - The list of events to add to.
 * @param {Object} event - The event object containing the old and new values to compare.
 * @returns {void}
 */
function addEventChanges(eventsList, event) {
    const changeFields = [
        { old: 'oldServerMute', new: 'newServerMute', eventName: 'serverMute' },
        { old: 'oldServerDeaf', new: 'newServerDeaf', eventName: 'serverDeaf' },
        { old: 'oldStream', new: 'newStream', eventName: 'selfStream' },
        { old: 'oldCam', new: 'newCam', eventName: 'selfCam' },
        { old: 'oldClientMute', new: 'newClientMute', eventName: 'clientMute' },
        { old: 'oldClientDeaf', new: 'newClientDeaf', eventName: 'clientDeaf' }
    ];

    changeFields.forEach(({ old, new: newField, eventName }) => {
        if (event[old] !== event[newField]) {
            eventsList.push({
                datetime: event.datetime,
                eventName: eventName,
                stats: event[newField]
            });
        }
    });
}

/**
 * Adds events to the given events list based on the differences between the old and new values in the given event.
 * The added events are serverMute, serverDeaf, selfStream, selfCam, clientMute and clientDeaf.
 * @param {Array<Object>} eventsList - The list of events to add to.
 * @param {Object} event - The event object containing the old and new values to compare.
 * @returns {void}
 */
function addEventChanges(eventsList, event) {
    const changeFields = [
        { old: 'oldServerMute', new: 'newServerMute', eventName: 'serverMute' },
        { old: 'oldServerDeaf', new: 'newServerDeaf', eventName: 'serverDeaf' },
        { old: 'oldStream', new: 'newStream', eventName: 'selfStream' },
        { old: 'oldCam', new: 'newCam', eventName: 'selfCam' },
        { old: 'oldClientMute', new: 'newClientMute', eventName: 'clientMute' },
        { old: 'oldClientDeaf', new: 'newClientDeaf', eventName: 'clientDeaf' }
    ];

    changeFields.forEach(({ old, new: newField, eventName }) => {
        if (event[old] !== event[newField]) {
            eventsList.push({
                datetime: event.datetime,
                eventName: eventName,
                stats: event[newField]
            });
        }
    });
}

/**
 * Adds events to the given events list based on the differences between the old and new values in the given event.
 * The added events are serverMute, serverDeaf, selfStream, selfCam, clientMute and clientDeaf.
 * @param {Array<Object>} eventsList - The list of events to add to.
 * @param {Object} event - The event object containing the old and new values to compare.
 * @returns {void}
 */
function addEventChanges(eventsList, event) {
    const changeFields = [
        { old: 'oldServerMute', new: 'newServerMute', eventName: 'serverMute' },
        { old: 'oldServerDeaf', new: 'newServerDeaf', eventName: 'serverDeaf' },
        { old: 'oldStream', new: 'newStream', eventName: 'selfStream' },
        { old: 'oldCam', new: 'newCam', eventName: 'selfCam' },
        { old: 'oldClientMute', new: 'newClientMute', eventName: 'clientMute' },
        { old: 'oldClientDeaf', new: 'newClientDeaf', eventName: 'clientDeaf' }
    ];

    changeFields.forEach(({ old, new: newField, eventName }) => {
        if (event[old] !== event[newField]) {
            eventsList.push({
                datetime: event.datetime,
                eventName: eventName,
                stats: event[newField]
            });
        }
    });
}


async function getMessageDetails(messageId) {
    try {
        const message = await global.eventsDatabase.EVENTS_messageCreate.findOne({
            where: { messageId },
        });

        if (!message) {
            return { error: "Message not found", status_code: 404 };
        }
        const messageDetails = {
            messageId: message.messageId,
            authorId: message.userId,
            createdTimestamp: message.datetime,
            createdAt: function (utcOffset = 0, locale = 'en') {
                if (!message.datetime) return null;
                return new Date(message.datetime + utcOffset * 3600 * 1000).toLocaleString(locale, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            },
            channelId: message.channelId,
            content: message.content,
            attachments: message.attachments || [],
            replies: [],
            reactions: [],
            deletedAt: null,
            deletedTimestamp: null
        };
        const messageDeleted = await global.eventsDatabase.EVENTS_messageDelete.findOne({
            where: { messageId },
        });
        if (messageDeleted) {
            message.deletedTimestamp = messageDeleted.date;
            messageDetails.deletedAt = function (utcOffset = 0, locale = 'en') {
                if (!messageDetails.deletedAt) return null;
                return new Date(messageDetails.deletedAt + utcOffset * 3600 * 1000).toLocaleString(locale, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            }
        }
        
        const replies = await global.eventsDatabase.EVENTS_messageCreate.findAll({
            where: { replyToMessageId: messageId },
        });
        messageDetails.replies = replies.map((reply) => ({
            messageId: reply.messageId,
            authorId: reply.userId,
            createdTimestamp: reply.date,
            createdAt: function (utcOffset = 0, locale = 'en') {
                if (!reply.datee) return null;
                return new Date(reply.date + utcOffset * 3600 * 1000).toLocaleString(locale, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            },
            content: reply.content,
            attachments: reply.attachments || [],
        }));
        const reactions = await global.eventsDatabase.EVENTS_messageReactionAdd.findAll({
            where: { messageId },
        });
        for (const reaction of reactions) {
            const reactionRemoved = await global.eventsDatabase.EVENTS_messageReactionRemove.findOne({
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
        console.error(error);
        return { error: "Internal Server Error", status_code: 500 };
    }
};

global.database_cache.get_voice_member = async function (userid) {
    return await getVoiceConnectionStatusWithEvents(await global.eventsDatabase.getVoiceStateUpdatesByUserId(userid));
}

global.database_cache.get_message = async function (messageId) {
    return await getMessageDetails(messageId)
}