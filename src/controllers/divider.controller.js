const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { dividerService } = require('../services');
const queryParser = require('../utils/queryParser');

const createDivider = catchAsync(async (req, res) => {
  req.body.user = req.user._id;
  const divider = await dividerService.createDivider(req.body);
  res.status(httpStatus.CREATED).send(divider);
});

const getDividers = catchAsync(async (req, res) => {
  const { filter, options } = queryParser(req.query);
  const result = await dividerService.queryDividers(filter, options);
  res.send(result);
});

const getDivider = catchAsync(async (req, res) => {
  const divider = await dividerService.getDividerById(req.params.dividerId);
  if (!divider) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Divider not found');
  }
  res.send(divider);
});

const updateDivider = catchAsync(async (req, res) => {
  const dividerToEdit = await dividerService.getDividerById(req.params.dividerId);
  if (dividerToEdit.user.toString() !== req.user._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Unauthorized');
  }
  const divider = await dividerService.updateDividerById(req.params.dividerId, req.body);
  res.send(divider);
});

const deleteDivider = catchAsync(async (req, res) => {
  const dividerToDelete = await dividerService.getDividerById(req.params.dividerId);
  if (dividerToDelete.user.toString() !== req.user._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Unauthorized');
  }
  await dividerService.deleteDividerById(req.params.dividerId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createDivider,
  getDividers,
  getDivider,
  updateDivider,
  deleteDivider,
};
