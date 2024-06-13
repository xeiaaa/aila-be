const httpStatus = require('http-status');
const { Note } = require('../models');
const ApiError = require('../utils/ApiError');
const { getCompletion } = require('./openai.service');

/**
 * Create a note
 * @param {Object} noteBody
 * @returns {Promise<Note>}
 */
const createNote = async (noteBody) => {
  return Note.create(noteBody);
};

/**
 * Query for notes
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sort] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryNotes = async (filter, options) => {
  const notes = await Note.paginate(filter, options);
  return notes;
};

/**
 * Get note by id
 * @param {ObjectId} id
 * @returns {Promise<Note>}
 */
const getNoteById = async (id) => {
  return Note.findById(id);
};

/**
 * Update note by id
 * @param {ObjectId} noteId
 * @param {Object} updateBody
 * @returns {Promise<Note>}
 */
const updateNoteById = async (noteId, updateBody) => {
  const note = await getNoteById(noteId);
  if (!note) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Note not found');
  }
  Object.assign(note, updateBody);
  await note.save();
  return note;
};

/**
 * Delete note by id
 * @param {ObjectId} noteId
 * @returns {Promise<Note>}
 */
const deleteNoteById = async (noteId) => {
  const note = await getNoteById(noteId);
  if (!note) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Note not found');
  }
  await note.remove();
  return note;
};

/**
 * Generate summary
 * @param {string} transcription
 * @returns {Promise<string>}
 */
const generateNoteSummary = async (transcription) => {
  const promptStart = `[Summarize the following text. Maximum of 10 sentences. Use clear and simple language, even when explaining complex topics. Bias toward short sentences. Avoid jargon and acronyms.]':\n\n`;
  const prompt = `${promptStart} ${transcription}`;
  const summary = await getCompletion(prompt);

  return summary;
};

/**
 * Generate sample questions
 * @param {string} transcription
 * @returns {Promise<string>}
 */
const generateQuestions = async (transcription) => {
  const promptStart = `[Generate 3 questions from the following text. Avoid jargon and acronyms. Use markdown.]':\n\n`;
  const prompt = `${promptStart} ${transcription}`;

  const _questions = await getCompletion(prompt);
  const questions = _questions.split(/\d+\./).filter((sentence) => sentence.trim() !== '');
  return questions;
};

// /**
//  * Generate key takeaways
//  * @param {string} transcription
//  * @returns {Promise<string>}
//  */
// const generateKeyTakeaways = async (transcription) => {
//   const promptStart = `[Get the key takeaways from the following text. Use clear and simple language, even when explaining complex topics. Bias toward short sentences. Avoid jargon and acronyms. Use markdown bullets.]':\n\n`;
//   const prompt = `${promptStart} ${transcription}`;

//   const keyTakeaways = await getCompletion(prompt);

//   return keyTakeaways;
// };

/**
 * Generate tldr
 * @param {string} transcription
 * @returns {Promise<string>}
 */
const generateTLDR = async (transcription) => {
  const promptStart = `[Generate TLDR for the following text. Use clear and simple language, even when explaining complex topics. Bias toward short sentences. Avoid jargon and acronyms. Use markdown.]':\n\n`;
  const prompt = `${promptStart} ${transcription}`;

  const tldr = await getCompletion(prompt);

  return tldr;
};

const getUserNoteSize = async (userId) => {
  try {
    const userNotes = await Note.find({ user: userId });
    let totalSize = 0; // Use let instead of const

    // eslint-disable-next-line no-restricted-syntax
    for (const doc of userNotes) {
      const docObject = doc.toObject(); // Convert Mongoose document to plain object
      // eslint-disable-next-line no-restricted-syntax
      for (const key in docObject) {
        // eslint-disable-next-line no-prototype-builtins
        if (docObject.hasOwnProperty(key)) {
          const value = docObject[key];
          let fieldSize;

          if (typeof value === 'string') {
            fieldSize = Buffer.byteLength(value, 'utf8');
          } else if (Buffer.isBuffer(value)) {
            fieldSize = value.length;
          } else if (typeof value === 'object' && value !== null) {
            fieldSize = Buffer.byteLength(JSON.stringify(value), 'utf8');
          } else {
            fieldSize = Buffer.byteLength(String(value), 'utf8');
          }

          totalSize += fieldSize;
        }
      }
    }
    const totalSizeInKB = (totalSize / 1024).toFixed(2);
    const totalSizeInMB = (totalSizeInKB / 1024).toFixed(2);
    const totalSizeInGB = (totalSizeInMB / 1024).toFixed(2);

    let size;
    if (parseInt(totalSizeInGB, 10) !== 0) {
      size = `${totalSizeInGB} GB`;
    } else if (parseInt(totalSizeInMB, 10) !== 0) {
      size = `${totalSizeInMB} MB`;
    } else {
      size = `${totalSizeInKB} KB`;
    }

    return size;
  } catch (error) {
    console.error('Error calculating user note size:', error);
  }
};

module.exports = {
  createNote,
  queryNotes,
  getNoteById,
  updateNoteById,
  deleteNoteById,
  generateNoteSummary,
  generateQuestions,
  generateTLDR,
  getUserNoteSize,
};
