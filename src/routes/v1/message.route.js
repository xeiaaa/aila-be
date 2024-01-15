const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const messageValidation = require('../../validations/message.validation');
const messageController = require('../../controllers/message.controller');

const router = express.Router();

router.route('/').get(auth(), validate(messageValidation.getMessages), messageController.getMessages);
router.route('/:messageId').get(auth(), validate(messageValidation.getMessage), messageController.getMessage);

module.exports = router;
