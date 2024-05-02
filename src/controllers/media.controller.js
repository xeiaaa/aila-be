const httpStatus = require('http-status');

const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { mediaService, noteService } = require('../services');
const queryParser = require('../utils/queryParser');

const createMedia = catchAsync(async (req, res) => {
  req.body.user = req.user._id;
  const note = await noteService.getNoteById(req.body.note);
  if (!note) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Note not found');
  }

  if (!req.body.metaData.videoId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Video id not found');
  }

  const media = await mediaService.createMedia(req.body);
  note.media = {
    ...note.media,
    [req.body.type]: {
      media: media._id,
    },
  };

  await note.save();
  res.status(httpStatus.CREATED).send(media);
});

const getMedias = catchAsync(async (req, res) => {
  const { filter, options } = queryParser(req.query);
  const _filter = {
    ...filter,
    user: req.user._id,
  };
  const result = await mediaService.queryMedias(_filter, options);
  res.send(result);
});

const getMedia = catchAsync(async (req, res) => {
  const media = await mediaService.getMediaById(req.params.mediaId);
  if (!media) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Media not found');
  }
  if (media.user.toString() !== req.user._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Unauthorized');
  }
  res.send(media);
});

const updateMedia = catchAsync(async (req, res) => {
  const mediaToEdit = await mediaService.getMediaById(req.params.mediaId);
  if (mediaToEdit.user.toString() !== req.user._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Unauthorized');
  }
  const media = await mediaService.updateMediaById(req.params.mediaId, req.body);
  res.send(media);
});

const deleteMedia = catchAsync(async (req, res) => {
  const mediaToDelete = await mediaService.getMediaById(req.params.mediaId);
  if (mediaToDelete.user.toString() !== req.user._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Unauthorized');
  }
  await mediaService.deleteMediaById(req.params.mediaId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createMedia,
  getMedias,
  getMedia,
  updateMedia,
  deleteMedia,
};
