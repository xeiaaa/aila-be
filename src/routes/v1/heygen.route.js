const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const heygenValidation = require('../../validations/heygen.validation');
const heygenController = require('../../controllers/heygen.controller');

const router = express.Router();

router.route('/:mediaId/status').get(auth(), validate(heygenValidation.getVideoStatus), heygenController.getVideoStatus);
router.post('/generate-video', auth(), validate(heygenValidation.generateVideo), heygenController.generateHeyGenVideo);

module.exports = router;
