const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createNote = {
  body: Joi.object().keys({
    subject: Joi.string().custom(objectId).optional(),
    title: Joi.string().required(),
    transcription: Joi.string().optional(),
    url: Joi.string().optional(),
    type: Joi.string().required(),
    sortIndex: Joi.number().optional(),
  }),
};

const getNotes = {
  query: Joi.object().keys({
    filter: Joi.string(),
    sort: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string(),
  }),
};

const getNote = {
  params: Joi.object().keys({
    noteId: Joi.string().custom(objectId),
  }),
};

const updateNote = {
  params: Joi.object().keys({
    noteId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      subject: Joi.string().custom(objectId).optional(),
      title: Joi.string().optional(),
      transcription: Joi.string().optional(),
      sortIndex: Joi.number().optional(),
    })
    .min(1),
};

const deleteNote = {
  params: Joi.object().keys({
    noteId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
};
