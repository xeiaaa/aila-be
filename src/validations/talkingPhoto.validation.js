const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createTalkingPhoto = {
  body: Joi.object().keys({
    url: Joi.string().required(),
    photoId: Joi.string().required(),
  }),
};

const getTalkingPhotos = {
  query: Joi.object().keys({
    filter: Joi.string(),
    sort: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string(),
  }),
};

const getTalkingPhoto = {
  params: Joi.object().keys({
    talkingPhotoId: Joi.string().custom(objectId),
  }),
};

const updateTalkingPhoto = {
  params: Joi.object().keys({
    talkingPhotoId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      url: Joi.string(),
      photoId: Joi.string(),
    })
    .min(1),
};

const deleteTalkingPhoto = {
  params: Joi.object().keys({
    talkingPhotoId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createTalkingPhoto,
  getTalkingPhotos,
  getTalkingPhoto,
  updateTalkingPhoto,
  deleteTalkingPhoto,
};
