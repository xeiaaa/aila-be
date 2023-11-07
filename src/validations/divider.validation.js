const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createDivider = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    sortIndex: Joi.number().optional(),
  }),
};

const getDividers = {
  query: Joi.object().keys({
    filter: Joi.string(),
    sort: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string(),
  }),
};

const getDivider = {
  params: Joi.object().keys({
    dividerId: Joi.string().custom(objectId),
  }),
};

const updateDivider = {
  params: Joi.object().keys({
    dividerId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().optional(),
      sortIndex: Joi.number().optional(),
    })
    .min(1),
};

const deleteDivider = {
  params: Joi.object().keys({
    dividerId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createDivider,
  getDividers,
  getDivider,
  updateDivider,
  deleteDivider,
};
