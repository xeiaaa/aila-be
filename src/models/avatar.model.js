const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const avatarSchema = mongoose.Schema(
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
    talkingPhotoId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
avatarSchema.plugin(toJSON);
avatarSchema.plugin(paginate);

/**
 * @typedef Avatar
 */
const Avatar = mongoose.model('Avatar', avatarSchema);

module.exports = Avatar;
