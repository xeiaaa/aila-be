const PDFJS = require('pdfjs-dist/legacy/build/pdf');
const httpStatus = require('http-status');
const { OpenAI } = require('langchain');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { PineconeStore } = require('langchain/vectorstores/pinecone');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { AssemblyAI } = require('assemblyai');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const ytdl = require('ytdl-core');
const { ConversationalRetrievalQAChain } = require('langchain/chains');

const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { noteService, openaiService, pineconeService, messageService } = require('../services');
const queryParser = require('../utils/queryParser');
const { Note } = require('../models');
const { getEmbeddings, getCompletion } = require('../services/openai.service');
const { noteTypes } = require('../config/notes');
const embedText = require('./functions/embedText');
const transcribe = require('./functions/transcribe');
const { status } = require('../config/status');

const createNote = catchAsync(async (req, res) => {
  req.body.user = req.user._id;
  const note = await noteService.createNote(req.body);
  res.status(httpStatus.CREATED).send(note);
});

const createPDFNote = catchAsync(async (req, res) => {
  /*
    req.body = {
      url: 'PDF URL',
      subject: 'optional subjectId',
      transcription: 'optional',
      title,
    }
  */

  // Create new note
  req.body.user = req.user._id;
  req.body.type = noteTypes.PDF;
  const note = await noteService.createNote(req.body);

  res.send(note);
  const noteToUpdate = await noteService.getNoteById(note._id);

  try {
    // Process Pinecone
    const vectors = [];

    const myFiledata = await fetch(req.body.url);

    let transcription = '';

    if (myFiledata.ok) {
      const pdfDoc = await PDFJS.getDocument(await myFiledata.arrayBuffer()).promise;
      const { numPages } = pdfDoc;
      for (let i = 0; i < numPages; i += 1) {
        const page = await pdfDoc.getPage(i + 1);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item) => item.str).join('');
        transcription += `\n${text}`;

        // 5. Get embeddings for each page
        const embedding = await openaiService.getEmbeddings(text);

        // 6. push to vector array
        const metadata = {
          pageNum: i + 1,
          text,
          note: note._id,
          subject: req.body.subject,
          user: req.user._id,
        };
        console.log({ metadata, note });
        vectors.push({
          id: `page${i + 1}`,
          values: embedding,
          metadata,
        });
      }

      // 7. initialize pinecone
      await pineconeService.initialize(); // initialize pinecone

      // 8. connect to the index
      const index = pineconeService.pinecone.Index(process.env.PDB_INDEX);

      // 9. upsert to pinecone index
      await index.upsert({
        upsertRequest: {
          vectors,
        },
      });
    }

    // Update newnote isProcessed
    // note.isProcessed = true;
    // await note.save();

    noteToUpdate.transcription = transcription;
    noteToUpdate.status = status.SUCCESS;
    const summary = await noteService.generateNoteSummary(transcription);
    noteToUpdate.summary = summary;

    const questions = await noteService.generateQuestions(transcription);
    noteToUpdate.questions = questions;

    const tldr = await noteService.generateTLDR(transcription);
    noteToUpdate.tldr = tldr;

    await noteToUpdate.save();
  } catch (error) {
    noteToUpdate.status = status.FAILED;
    await noteToUpdate.save();
  }
});

const createTextNote = catchAsync(async (req, res) => {
  req.body.user = req.user._id;
  req.body.type = noteTypes.TEXT;
  const note = await noteService.createNote(req.body);

  await embedText(note);
  res.send(note);
  const noteToUpdate = await noteService.getNoteById(note._id);
  try {
    noteToUpdate.status = status.SUCCESS;
    const summary = await noteService.generateNoteSummary(noteToUpdate.transcription);
    noteToUpdate.summary = summary;

    const questions = await noteService.generateQuestions(noteToUpdate.transcription);
    noteToUpdate.questions = questions;

    const tldr = await noteService.generateTLDR(noteToUpdate.transcription);
    noteToUpdate.tldr = tldr;

    await noteToUpdate.save();
  } catch (error) {
    await noteToUpdate.save();
  }
});

const createVideoFileNote = catchAsync(async (req, res) => {
  req.body.user = req.user._id;
  req.body.type = noteTypes.VIDEO;
  const _note = await noteService.createNote(req.body);
  res.send(_note);
});

const createAudioFileNote = catchAsync(async (req, res) => {
  req.body.user = req.user._id;
  req.body.type = noteTypes.AUDIO;
  const _note = await noteService.createNote(req.body);
  res.send(_note);

  // Transcribe
  const noteToUpdate = await noteService.getNoteById(_note._id);
  try {
    const transcription = await transcribe(req.body.url);
    noteToUpdate.transcription = transcription;
    noteToUpdate.status = status.SUCCESS;
    const summary = await noteService.generateNoteSummary(transcription);
    noteToUpdate.summary = summary;

    const questions = await noteService.generateQuestions(noteToUpdate.transcription);
    noteToUpdate.questions = questions;

    const tldr = await noteService.generateTLDR(noteToUpdate.transcription);
    noteToUpdate.tldr = tldr;
    const note = await noteToUpdate.save();
    await embedText(note);
  } catch (error) {
    noteToUpdate.status = status.FAILED;
    await noteToUpdate.save();
  }
});

const createUrlNote = catchAsync(async (req, res) => {
  // Create new note
  req.body.user = req.user._id;
  req.body.type = noteTypes.URL;
  const _note = await noteService.createNote(req.body);
  res.send(_note);
  const noteToUpdate = await noteService.getNoteById(_note._id);

  try {
    // Scrape text from URL
    const { data } = await axios.get(req.body.url);
    const $ = cheerio.load(data);
    const transcription = $('body').text();
    noteToUpdate.transcription = transcription;
    noteToUpdate.status = status.SUCCESS;
    const summary = await noteService.generateNoteSummary(transcription);
    noteToUpdate.summary = summary;

    const questions = await noteService.generateQuestions(noteToUpdate.transcription);
    noteToUpdate.questions = questions;

    const tldr = await noteService.generateTLDR(noteToUpdate.transcription);
    noteToUpdate.tldr = tldr;
    const note = await noteToUpdate.save();

    await embedText(note);
  } catch (error) {
    noteToUpdate.status = status.FAILED;
    await noteToUpdate.save();
  }
});

const queryNote = catchAsync(async (req, res) => {
  const { query, id } = req.body;

  // 4. get embeddings for the query
  const questionEmb = await getEmbeddings(query);
  await pineconeService.initialize();
  const index = pineconeService.pinecone.Index(process.env.PDB_INDEX || '');

  // 7. query the pinecone db
  const queryRequest = {
    vector: questionEmb,
    topK: 5,
    includeValues: true,
    includeMetadata: true,
    filter: { note: { $eq: id } },
  };

  const result = await index.query({ queryRequest });

  console.info({ result });
  // 8. get the metadata from the results
  let contexts = result.matches.map((item) => item.metadata.text);

  contexts = contexts.join('\n\n---\n\n');

  console.log(typeof contexts);
  console.log('--contexts--', contexts);
  if (typeof contexts !== 'string' || !contexts) {
    return res.status(400).send('Unprocessed file');
  }

  // 9. build the prompt
  const promptStart = `Answer the question based on the context below:\n\n`;
  const promptEnd = `\n\nQuestion: ${query} \n\nAnswer:`;

  const prompt = `${promptStart} ${contexts} ${promptEnd}`;

  console.log('--prompt--', prompt);

  // 10. get the completion from openai
  const response = await getCompletion(prompt);

  console.log('--completion--', response);

  // 11. return the response
  res.status(200).json({ response });
});

const chatNote = catchAsync(async (req, res) => {
  const { question, chatHistory = [], id: noteId } = req.body;

  // Create a message of user
  const messagePayload = {
    user: req.user._id,
    message: question,
    note: noteId,
  };
  const senderMessage = await messageService.createMessage(messagePayload);

  await pineconeService.initialize();
  const pineconeIndex = pineconeService.pinecone.Index(process.env.PDB_INDEX || '');

  const metadataFilter = { note: { $eq: noteId } };

  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    }),
    { pineconeIndex, filter: metadataFilter }
  );

  /* Use as part of a chain (currently no metadata filters) */
  const model = new OpenAI({ modelName: 'gpt-3.5-turbo' });

  const chain = ConversationalRetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

  const query = await chain.call({ question, chat_history: chatHistory });
  // Create a message of ai
  const aiMessagePayload = {
    user: req.user._id,
    message: query.text,
    note: noteId,
    isAi: true,
  };

  const message = await messageService.createMessage(aiMessagePayload);
  return res.status(200).json([senderMessage, message]);
});

const createYoutubeNote = catchAsync(async (req, res) => {
  const { url } = req.body;

  const youtubeInfo = await ytdl.getInfo(url);
  const formats = Array.isArray(youtubeInfo.formats) ? youtubeInfo.formats : [];
  let audioFile = formats.find((format) => (format.mimeType || '').includes('audio/mp4'));
  if (!audioFile) {
    audioFile = formats.find((format) => (format.mimeType || '').includes('video/mp4'));
  }

  if (!audioFile) {
    return res.send(400).message('');
  }

  req.body.user = req.user._id;
  req.body.type = noteTypes.YOUTUBE;
  const _note = await noteService.createNote(req.body);
  res.send(_note);
  const noteToUpdate = await noteService.getNoteById(_note._id);

  try {
    // Transcribe
    console.log('Transcribing', audioFile.url);
    const transcription = await transcribe(audioFile.url);
    console.log('transcribed', transcription);
    noteToUpdate.transcription = transcription;
    noteToUpdate.status = status.SUCCESS;
    const summary = await noteService.generateNoteSummary(transcription);
    noteToUpdate.summary = summary;

    const questions = await noteService.generateQuestions(noteToUpdate.transcription);
    noteToUpdate.questions = questions;

    const tldr = await noteService.generateTLDR(noteToUpdate.transcription);
    noteToUpdate.tldr = tldr;
    const note = await noteToUpdate.save();

    await embedText(note);
  } catch (error) {
    noteToUpdate.status = status.FAILED;
    await noteToUpdate.save();
  }
});

const getNotes = catchAsync(async (req, res) => {
  const { filter, options } = queryParser(req.query);
  filter.user = req.user._id.toString();
  const result = await noteService.queryNotes(filter, options);
  res.send(result);
});

const getNote = catchAsync(async (req, res) => {
  const note = await noteService.getNoteById(req.params.noteId);
  if (!note) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Note not found');
  }
  res.send(note);
});

const updateNote = catchAsync(async (req, res) => {
  const noteToEdit = await noteService.getNoteById(req.params.noteId);

  if (noteToEdit.user.toString() !== req.user._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Unauthorized');
  }
  const note = await noteService.updateNoteById(req.params.noteId, req.body);
  if (req.body.transcription) {
    await pineconeService.initialize();
    const index = pineconeService.pinecone.Index(process.env.PDB_INDEX);
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    const embeddedQuery = await embeddings.embedQuery('');

    const queryRequest = {
      topK: 1,
      vector: embeddedQuery,
      includeMetadata: true,
      includeValues: true,
      filter: {
        note: req.params.noteId,
      },
    };

    const queryResponse = await index.query({ queryRequest });
    if (queryResponse.matches.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Note not found');
    }
    await index._delete({
      deleteRequest: {
        ids: queryResponse.matches.map((id) => id.toString()),
      },
    });
    await embedText(note);
  }

  res.send(note);
});

const deleteNote = catchAsync(async (req, res) => {
  const noteToDelete = await noteService.getNoteById(req.params.noteId);
  if (noteToDelete.user.toString() !== req.user._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Unauthorized');
  }
  await noteService.deleteNoteById(req.params.noteId);
  res.status(httpStatus.NO_CONTENT).send();
});

const archivedNote = catchAsync(async (req, res) => {
  const note = await noteService.getNoteById(req.params.noteId);
  if (note.user.toString() !== req.user._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Unauthorized');
  }
  note.isArchived = true;
  await note.save();
  res.status(httpStatus.NO_CONTENT).send();
});

const retrievedNote = catchAsync(async (req, res) => {
  const note = await noteService.getNoteById(req.params.noteId);
  if (note.user.toString() !== req.user._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Unauthorized');
  }
  note.isArchived = false;
  await note.save();
  res.status(httpStatus.NO_CONTENT).send();
});

const summarize = catchAsync(async (req, res) => {
  const note = await noteService.getNoteById(req.params.noteId);
  if (!note) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Note not found');
  }

  if (!note.transcription) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Note not processed yet');
  }

  const response = await noteService.generateNoteSummary(note.transcription);
  note.summary = response;
  await note.save();

  res.status(200).json({ response });
});

module.exports = {
  createNote,
  createPDFNote,
  createTextNote,
  createVideoFileNote,
  createAudioFileNote,
  createUrlNote,
  createYoutubeNote,
  queryNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
  chatNote,
  summarize,
  archivedNote,
  retrievedNote,
};
