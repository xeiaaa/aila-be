const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const mediaValidation = require('../../validations/media.validation');
const mediaController = require('../../controllers/media.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(mediaValidation.createMedia), mediaController.createMedia)
  .get(auth(), validate(mediaValidation.getMedias), mediaController.getMedias);

router
  .route('/:mediaId')
  .get(auth(), validate(mediaValidation.getMedia), mediaController.getMedia)
  .patch(auth(), validate(mediaValidation.updateMedia), mediaController.updateMedia)
  .delete(auth(), validate(mediaValidation.deleteMedia), mediaController.deleteMedia);

module.exports = router;
