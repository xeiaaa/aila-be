const httpStatus = require('http-status');
const { Media } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a media
 * @param {Object} mediaBody
 * @returns {Promise<Media>}
 */
const createMedia = async (mediaBody) => {
  return Media.create(mediaBody);
};

/**
 * Query for medias
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sort] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryMedias = async (filter, options) => {
  const medias = await Media.paginate(filter, options);
  return medias;
};

/**
 * Get media by id
 * @param {ObjectId} id
 * @returns {Promise<Media>}
 */
const getMediaById = async (id) => {
  return Media.findById(id);
};

/**
 * Update media by id
 * @param {ObjectId} mediaId
 * @param {Object} updateBody
 * @returns {Promise<Media>}
 */
const updateMediaById = async (mediaId, updateBody) => {
  const media = await getMediaById(mediaId);
  if (!media) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Media not found');
  }
  Object.assign(media, updateBody);
  await media.save();
  return media;
};

/**
 * Delete media by id
 * @param {ObjectId} mediaId
 * @returns {Promise<Media>}
 */
const deleteMediaById = async (mediaId) => {
  const media = await getMediaById(mediaId);
  if (!media) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Media not found');
  }
  await media.remove();
  return media;
};

module.exports = {
  createMedia,
  queryMedias,
  getMediaById,
  updateMediaById,
  deleteMediaById,
};
