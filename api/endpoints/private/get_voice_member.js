const ParamCaretaker = require('../../Modules/ParamCaretaker');

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
        connectAt: event.datetime,
        disconnectAt: null,
        disconnectBy: null,
        stillConnected: true,
        events: [],
        messages: [],
        connectedChannelId: event.newChannelId,
        disconnectedChannelId: null
      };

    } else if (event.eventType === 3) {
      if (connectEvents[userId]) {
        connectEvents[userId].disconnectAt = event.datetime;
        connectEvents[userId].disconnectBy = event.executorId;
        connectEvents[userId].stillConnected = false;
        connectEvents[userId].disconnectedChannelId = event.oldChannelId;

        const { connectedChannelId, disconnectedChannelId } = connectEvents[userId];
        const channelIds = [connectedChannelId];

        if (disconnectedChannelId && disconnectedChannelId !== connectedChannelId) {
          channelIds.push(disconnectedChannelId);
        }

        console.log(`Canaux pour l'utilisateur ${userId}:`, channelIds);

        if (channelIds.length > 0) {
          const messages = await global.Database.getMessagesBetweenDates(
            userId,
            connectEvents[userId].connectAt,
            connectEvents[userId].disconnectAt || Date.now(),
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
      const messages = await global.Database.getMessagesBetweenDates(
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

    const pairs = getVoiceConnectionStatusWithEvents(await global.Database.getVoiceStateUpdatesByUserId(requestData.userid));

    return pairs

  },
};
