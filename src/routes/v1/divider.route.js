const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const dividerValidation = require('../../validations/divider.validation');
const dividerController = require('../../controllers/divider.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(dividerValidation.createDivider), dividerController.createDivider)
  .get(auth(), validate(dividerValidation.getDividers), dividerController.getDividers);

router
  .route('/:dividerId')
  .get(auth(), validate(dividerValidation.getDivider), dividerController.getDivider)
  .patch(auth(), validate(dividerValidation.updateDivider), dividerController.updateDivider)
  .delete(auth(), validate(dividerValidation.deleteDivider), dividerController.deleteDivider);

module.exports = router;
