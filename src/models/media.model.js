const mongoose = require('mongoose');

const { toJSON, paginate } = require('./plugins');
const { mediaType } = require('../config/mediaType');

const mediaSchema = mongoose.Schema(
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
    note: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Note',
    },
    type: {
      type: String,
      enum: mediaType,
      required: true,
    },
    metaData: {
      type: Object,
    },
    url: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
mediaSchema.plugin(toJSON);
mediaSchema.plugin(paginate);

/**
 * @typedef Media
 */
const Media = mongoose.model('Media', mediaSchema);

module.exports = Media;
