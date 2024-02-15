const Joi = require('joi');
const { objectId } = require('./custom.validation');

const generateVideo = {
  body: Joi.object().keys({
    photoId: Joi.string().required(),
    summary: Joi.string().required(),
    voiceId: Joi.string().required(),
  }),
};

const getVideoStatus = {
  params: Joi.object().keys({
    mediaId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  generateVideo,
  getVideoStatus,
};
