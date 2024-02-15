const httpStatus = require('http-status');
const { TalkingPhoto } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a talkingPhoto
 * @param {Object} talkingPhotoBody
 * @returns {Promise<TalkingPhoto>}
 */
const createTalkingPhoto = async (talkingPhotoBody) => {
  return TalkingPhoto.create(talkingPhotoBody);
};

/**
 * Query for talkingPhotos
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sort] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryTalkingPhotos = async (filter, options) => {
  const talkingPhotos = await TalkingPhoto.paginate(filter, options);
  return talkingPhotos;
};

/**
 * Get talkingPhoto by id
 * @param {ObjectId} id
 * @returns {Promise<TalkingPhoto>}
 */
const getTalkingPhotoById = async (id) => {
  return TalkingPhoto.findById(id);
};

/**
 * Update talkingPhoto by id
 * @param {ObjectId} talkingPhotoId
 * @param {Object} updateBody
 * @returns {Promise<TalkingPhoto>}
 */
const updateTalkingPhotoById = async (talkingPhotoId, updateBody) => {
  const talkingPhoto = await getTalkingPhotoById(talkingPhotoId);
  if (!talkingPhoto) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Talking Photo not found');
  }
  Object.assign(talkingPhoto, updateBody);
  await talkingPhoto.save();
  return talkingPhoto;
};

/**
 * Delete talkingPhoto by id
 * @param {ObjectId} talkingPhotoId
 * @returns {Promise<TalkingPhoto>}
 */
const deleteTalkingPhotoById = async (talkingPhotoId) => {
  const talkingPhoto = await getTalkingPhotoById(talkingPhotoId);
  if (!talkingPhoto) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Talking Photo not found');
  }
  await talkingPhoto.remove();
  return talkingPhoto;
};

module.exports = {
  createTalkingPhoto,
  queryTalkingPhotos,
  getTalkingPhotoById,
  updateTalkingPhotoById,
  deleteTalkingPhotoById,
};
