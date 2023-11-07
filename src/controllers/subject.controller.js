const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { subjectService } = require('../services');
const queryParser = require('../utils/queryParser');

const createSubject = catchAsync(async (req, res) => {
  req.body.user = req.user._id;
  const subject = await subjectService.createSubject(req.body);
  res.status(httpStatus.CREATED).send(subject);
});

const getSubjects = catchAsync(async (req, res) => {
  const { filter, options } = queryParser(req.query);
  const result = await subjectService.querySubjects(filter, options);
  res.send(result);
});

const getSubject = catchAsync(async (req, res) => {
  const subject = await subjectService.getSubjectById(req.params.subjectId);
  if (!subject) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Subject not found');
  }
  res.send(subject);
});

const updateSubject = catchAsync(async (req, res) => {
  const subjectToEdit = await subjectService.getSubjectById(req.params.subjectId);
  if (subjectToEdit.user.toString() !== req.user._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Unauthorized');
  }
  const subject = await subjectService.updateSubjectById(req.params.subjectId, req.body);
  res.send(subject);
});

const deleteSubject = catchAsync(async (req, res) => {
  const subjectToDelete = await subjectService.getSubjectById(req.params.subjectId);
  if (subjectToDelete.user.toString() !== req.user._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Unauthorized');
  }
  await subjectService.deleteSubjectById(req.params.subjectId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createSubject,
  getSubjects,
  getSubject,
  updateSubject,
  deleteSubject,
};
