const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const talkingPhotoValidation = require('../../validations/talkingPhoto.validation');
const talkingPhotoController = require('../../controllers/talkingPhoto.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(talkingPhotoValidation.createTalkingPhoto), talkingPhotoController.createTalkingPhoto)
  .get(auth(), validate(talkingPhotoValidation.getTalkingPhotos), talkingPhotoController.getTalkingPhotos);

router
  .route('/:talkingPhotoId')
  .get(auth(), validate(talkingPhotoValidation.getTalkingPhoto), talkingPhotoController.getTalkingPhoto)
  .patch(auth(), validate(talkingPhotoValidation.updateTalkingPhoto), talkingPhotoController.updateTalkingPhoto)
  .delete(auth(), validate(talkingPhotoValidation.deleteTalkingPhoto), talkingPhotoController.deleteTalkingPhoto);

module.exports = router;
