const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { talkingPhotoService } = require('../services');
const queryParser = require('../utils/queryParser');

const createTalkingPhoto = catchAsync(async (req, res) => {
  req.body.user = req.user._id;
  const talkingPhoto = await talkingPhotoService.createTalkingPhoto(req.body);
  res.status(httpStatus.CREATED).send(talkingPhoto);
});

const getTalkingPhotos = catchAsync(async (req, res) => {
  const { filter, options } = queryParser(req.query);
  const _filter = {
    ...filter,
    user: req.user._id,
  };
  const result = await talkingPhotoService.queryTalkingPhotos(_filter, options);
  res.send(result);
});

const getTalkingPhoto = catchAsync(async (req, res) => {
  const talkingPhoto = await talkingPhotoService.getTalkingPhotoById(req.params.talkingPhotoId);
  if (!talkingPhoto) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Talking Photo not found');
  }
  if (talkingPhoto.user.toString() !== req.user._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Unauthorized');
  }
  res.send(talkingPhoto);
});

const updateTalkingPhoto = catchAsync(async (req, res) => {
  const talkingPhotoToEdit = await talkingPhotoService.getTalkingPhotoById(req.params.talkingPhotoId);
  if (talkingPhotoToEdit.user.toString() !== req.user._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Unauthorized');
  }
  const talkingPhoto = await talkingPhotoService.updateTalkingPhotoById(req.params.talkingPhotoId, req.body);
  res.send(talkingPhoto);
});

const deleteTalkingPhoto = catchAsync(async (req, res) => {
  const talkingPhotoToDelete = await talkingPhotoService.getTalkingPhotoById(req.params.talkingPhotoId);
  if (talkingPhotoToDelete.user.toString() !== req.user._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Unauthorized');
  }
  await talkingPhotoService.deleteTalkingPhotoById(req.params.talkingPhotoId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createTalkingPhoto,
  getTalkingPhotos,
  getTalkingPhoto,
  updateTalkingPhoto,
  deleteTalkingPhoto,
};
