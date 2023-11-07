const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const dividerSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
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
dividerSchema.plugin(toJSON);
dividerSchema.plugin(paginate);

/**
 * @typedef Divider
 */
const Divider = mongoose.model('Divider', dividerSchema);

module.exports = Divider;
