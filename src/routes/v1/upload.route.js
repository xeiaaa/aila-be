const express = require('express');
const auth = require('../../middlewares/auth');
const uploadController = require('../../controllers/upload.controller');

const router = express.Router();

// router.get('/', auth(), uploadController.getPresignedUrl);
router.get('/', uploadController.getPresignedUrl);

module.exports = router;

/*
  1 - CLIENT network request for presigned url
  2 - SERVER get presigned url from AWS S3
  3 - SERVER send back presigned url to CLIENT
*/
