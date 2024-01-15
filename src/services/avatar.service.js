const httpStatus = require('http-status');
const axios = require('axios');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

const getVoices = async () => {
  const response = await axios.get('https://api.heygen.com/v1/voice.list', {
    headers: {
      'X-Api-Key': process.env.HEYGEN_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  console.log(response.data.data.list);

  return response.data.data.list;
};

const generateVideo = async (talkingPhotoId, script, voiceId) => {
  const requestBody = {
    video_inputs: [
      {
        character: {
          type: 'talking_photo',
          talking_photo_id: talkingPhotoId,
        },
        voice: {
          type: 'text',
          input_text: script,
          voice_id: voiceId,
        },
        background: {
          type: 'color',
          value: '#FAFAFA',
        },
      },
    ],
    test: true,
    aspect_ratio: '16:9',
  };
};

module.exports = {
  getVoices,
  generateVideo,
};
