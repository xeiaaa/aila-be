const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { messageService } = require('../services');
const queryParser = require('../utils/queryParser');

const createMessage = catchAsync(async (req, res) => {
  req.body.user = req.user._id;
  const message = await messageService.createMessage(req.body);
  res.status(httpStatus.CREATED).send(message);
});

const getMessages = catchAsync(async (req, res) => {
  const { filter, options } = queryParser(req.query);
  const result = await messageService.queryMessages(filter, options);
  res.send(result);
});

const getMessage = catchAsync(async (req, res) => {
  const message = await messageService.getMessageById(req.params.messageId);
  if (!message) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Message not found');
  }
  res.send(message);
});

module.exports = {
  createMessage,
  getMessages,
  getMessage,
};
