const mongoose = require('mongoose');

const postSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    caption: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * @typedef Post
 */
const Post = mongoose.model('Post', postSchema);

module.exports = Post;
