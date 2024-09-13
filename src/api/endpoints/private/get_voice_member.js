const spectraget = require('spectraget')

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
    const validationError = spectraget.validate(ep, requestData);
    if (requestData.key !== "bAhRTVpaXS4FvEeD9k2KLOI6Ho92MReU" || !requestData.key) {
      return { error: 'Unauthorized', status_code: 401 }
    }
    if (validationError) {
      return validationError;
    }

    const pairs = await global.databaseCache.get_voice_member(requestData.userid)
    return pairs

  },
};
