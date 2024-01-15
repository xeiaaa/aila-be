const Upload = require('../models/upload.model');

const createUpload = async (postBody) => {
  return Upload.create(postBody);
};

/**
 * Query for posts
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sort] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUploads = async (filter, options) => {
  const posts = await Upload.paginate(filter, options);
  return posts;
};

module.exports = {
  createUpload,
  queryUploads,
};
