const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getMessages = {
  query: Joi.object().keys({
    filter: Joi.string(),
    sort: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string(),
  }),
};

const getMessage = {
  params: Joi.object().keys({
    messageId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  getMessage,
  getMessages,
};
