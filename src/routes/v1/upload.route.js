const express = require('express');
const auth = require('../../middlewares/auth');
const { uploadController } = require('../../controllers');
const uploadValidation = require('../../validations/upload.validation');
const validate = require('../../middlewares/validate');

const router = express.Router();
router
  .route('/')
  .post(auth(), validate(uploadValidation.createUpload), uploadController.createUpload)
  .get(auth(), uploadController.getUserUploads);

router.route('/s3-signed-url').get(uploadController.getSignedUrl);

module.exports = router;
