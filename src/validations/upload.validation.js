const Joi = require('joi');

const createUpload = {
  body: Joi.object().keys({
    url: Joi.string().required(),
  }),
};

module.exports = {
  createUpload,
};
