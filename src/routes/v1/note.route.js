const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const noteValidation = require('../../validations/note.validation');
const noteController = require('../../controllers/note.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(noteValidation.createNote), noteController.createPDFNote)
  .get(auth(), validate(noteValidation.getNotes), noteController.getNotes);

router.post('/pdf', auth(), noteController.createPDFNote);
router.post('/text', auth(), noteController.createTextNote);
router.post('/audio', auth(), noteController.createAudioFileNote);
router.post('/video', auth(), noteController.createVideoFileNote);
router.post('/url', auth(), noteController.createUrlNote);
router.post('/youtube', auth(), noteController.createYoutubeNote);
router.post('/query', auth(), noteController.queryNote);
router.post('/chat', auth(), noteController.chatNote);

router
  .route('/:noteId')
  .get(auth(), validate(noteValidation.getNote), noteController.getNote)
  .patch(auth(), validate(noteValidation.updateNote), noteController.updateNote)
  .delete(auth(), validate(noteValidation.deleteNote), noteController.deleteNote)
  .post(auth(), validate(noteValidation.deleteNote), noteController.archivedNote);

router.route('/:noteId/summarize').get(auth(), validate(noteValidation.getNote), noteController.summarize);
router.route('/:noteId/retrieve').post(auth(), validate(noteValidation.deleteNote), noteController.retrievedNote);

module.exports = router;
