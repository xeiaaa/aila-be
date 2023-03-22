const express = require('express');
const auth = require('../../middlewares/auth');
const uploadController = require('../../controllers/upload.controller');

const router = express.Router();

router.get('/', auth(), uploadController.getPresignedUrl);

module.exports = router;
