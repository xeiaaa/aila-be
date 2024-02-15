const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createMedia = {
  body: Joi.object().keys({
    subject: Joi.string().custom(objectId).optional(),
    note: Joi.string().custom(objectId).required(),
    type: Joi.string().required().valid('pdf', 'video', 'audio'),
    metaData: Joi.object(),
    url: Joi.string(),
  }),
};

const getMedias = {
  query: Joi.object().keys({
    filter: Joi.string(),
    sort: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string(),
  }),
};

const getMedia = {
  params: Joi.object().keys({
    mediaId: Joi.string().custom(objectId),
  }),
};

const updateMedia = {
  params: Joi.object().keys({
    mediaId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      subject: Joi.string().custom(objectId).optional(),
      note: Joi.string().custom(objectId),
      type: Joi.string().valid('pdf', 'video', 'audio'),
      metaData: Joi.object(),
      url: Joi.string(),
    })
    .min(1),
};

const deleteMedia = {
  params: Joi.object().keys({
    mediaId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createMedia,
  getMedias,
  getMedia,
  updateMedia,
  deleteMedia,
};
