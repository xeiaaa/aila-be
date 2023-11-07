const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createSubject = {
  body: Joi.object().keys({
    divider: Joi.string().custom(objectId).optional(),
    name: Joi.string().required(),
    colorHex: Joi.string().required(),
    sortIndex: Joi.number().optional(),
  }),
};

const getSubjects = {
  query: Joi.object().keys({
    filter: Joi.string(),
    sort: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string(),
  }),
};

const getSubject = {
  params: Joi.object().keys({
    subjectId: Joi.string().custom(objectId),
  }),
};

const updateSubject = {
  params: Joi.object().keys({
    subjectId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      divider: Joi.string().custom(objectId).optional(),
      name: Joi.string().optional(),
      colorHex: Joi.string().optional(),
      sortIndex: Joi.number().optional(),
    })
    .min(1),
};

const deleteSubject = {
  params: Joi.object().keys({
    subjectId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createSubject,
  getSubjects,
  getSubject,
  updateSubject,
  deleteSubject,
};
