const httpStatus = require('http-status');
const { Divider } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a divider
 * @param {Object} dividerBody
 * @returns {Promise<Divider>}
 */
const createDivider = async (dividerBody) => {
  return Divider.create(dividerBody);
};

/**
 * Query for dividers
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sort] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryDividers = async (filter, options) => {
  const dividers = await Divider.paginate(filter, options);
  return dividers;
};

/**
 * Get divider by id
 * @param {ObjectId} id
 * @returns {Promise<Divider>}
 */
const getDividerById = async (id) => {
  return Divider.findById(id);
};

/**
 * Update divider by id
 * @param {ObjectId} dividerId
 * @param {Object} updateBody
 * @returns {Promise<Divider>}
 */
const updateDividerById = async (dividerId, updateBody) => {
  const divider = await getDividerById(dividerId);
  if (!divider) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Divider not found');
  }
  Object.assign(divider, updateBody);
  await divider.save();
  return divider;
};

/**
 * Delete divider by id
 * @param {ObjectId} dividerId
 * @returns {Promise<Divider>}
 */
const deleteDividerById = async (dividerId) => {
  const divider = await getDividerById(dividerId);
  if (!divider) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Divider not found');
  }
  await divider.remove();
  return divider;
};

module.exports = {
  createDivider,
  queryDividers,
  getDividerById,
  updateDividerById,
  deleteDividerById,
};
