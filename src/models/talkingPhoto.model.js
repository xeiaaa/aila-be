const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const talkingPhotoSchema = mongoose.Schema(
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
    photoId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
talkingPhotoSchema.plugin(toJSON);
talkingPhotoSchema.plugin(paginate);

/**
 * @typedef TalkingPhoto
 */
const TalkingPhoto = mongoose.model('TalkingPhoto', talkingPhotoSchema);

module.exports = TalkingPhoto;
