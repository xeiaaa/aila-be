const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { avatarService } = require('../services');
const queryParser = require('../utils/queryParser');
const { voices } = require('../config/voices');

const getVoices = catchAsync(async (req, res) => {
  // TODO: UNCOMMENT to get real voice list from HEYGEN
  // const allVoices = await avatarService.getVoices();
  // const voices = allVoices.filter((voice) => voice.locale === 'en-US' && !voice.is_paid);

  res.send(voices);
});

module.exports = {
  getVoices,
};
