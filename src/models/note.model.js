const mongoose = require('mongoose');
const { noteTypes } = require('../config/notes');
const { toJSON, paginate } = require('./plugins');

const noteSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Subject',
    },
    title: {
      type: String,
      required: true,
    },
    transcription: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
    isProcessed: {
      type: Boolean,
      required: false,
      default: false,
    },
    type: {
      type: String,
      enum: [
        noteTypes.PDF,
        noteTypes.YOUTUBE,
        noteTypes.TEXT,
        noteTypes.VIDEO,
        noteTypes.AUDIO,
        noteTypes.IMAGE,
        noteTypes.URL,
      ],
      required: false,
      default: noteTypes.TEXT,
    },
    sortIndex: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
noteSchema.plugin(toJSON);
noteSchema.plugin(paginate);

/**
 * @typedef Note
 */
const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
