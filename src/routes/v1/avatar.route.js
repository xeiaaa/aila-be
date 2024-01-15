const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const dividerValidation = require('../../validations/divider.validation');
const avatarController = require('../../controllers/avatar.controller');

const router = express.Router();

router.route('/voices').get(avatarController.getVoices);

module.exports = router;
