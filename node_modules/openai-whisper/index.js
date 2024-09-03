const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function transcribeAudioFile(filePath) {
  const formData = new FormData();
  formData.append('audio_file', fs.createReadStream(filePath), {contentType: 'audio/mpeg'});
  formData.append('task', 'transcribe');
  formData.append('output', 'txt');

  try {
    const api_url = "http://stt.amosayomide05.cf:9000/asr?task=transcribe&output=txt";
    const response = await axios.post(api_url, formData, {
      headers: {
        ...formData.getHeaders(),
        'accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

module.exports = { transcribeAudioFile };
