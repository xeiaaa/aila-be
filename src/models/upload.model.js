const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const uploadSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
uploadSchema.plugin(toJSON);
uploadSchema.plugin(paginate);

/**
 * @typedef Upload
 */
const Upload = mongoose.model('Upload', uploadSchema);

module.exports = Upload;
