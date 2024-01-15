const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

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
    media: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Media',
    },
    type: {
      type: String,
      // enum: ['audio', 'video', 'pdf'],
      required: true,
    },
    metaData: {
      type: Object,
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
