const PDFJS = require('pdfjs-dist/legacy/build/pdf');
const httpStatus = require('http-status');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { PineconeStore } = require('langchain/vectorstores/pinecone');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { AssemblyAI } = require('assemblyai');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const ytdl = require('ytdl-core');

const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { noteService, openaiService, pineconeService } = require('../services');
const queryParser = require('../utils/queryParser');
const { Note } = require('../models');
const { getEmbeddings, getCompletion } = require('../services/openai.service');
const { noteTypes } = require('../config/notes');

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

  // Process Pinecone
  const vectors = [];

  const myFiledata = await fetch(req.body.url);

  if (myFiledata.ok) {
    const pdfDoc = await PDFJS.getDocument(await myFiledata.arrayBuffer()).promise;
    const { numPages } = pdfDoc;
    for (let i = 0; i < numPages; i += 1) {
      const page = await pdfDoc.getPage(i + 1);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item) => item.str).join('');

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

  res.send(note);
});

const createTextNote = catchAsync(async (req, res) => {
  const { transcription } = req.body;

  // Create new note
  req.body.user = req.user._id;
  req.body.type = noteTypes.TEXT;
  const note = await noteService.createNote(req.body);

  await pineconeService.initialize();

  const pineconeIndex = pineconeService.pinecone.Index(process.env.PDB_INDEX || '');
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 200,
  });
  let output = await splitter.createDocuments([transcription]);
  // output[0].metadata.note = note._id.toString();
  output = output.map((_item, index) => {
    const item = { ..._item };
    const metadata = {
      pageNum: index + 1,
      text: transcription,
      note: note._id.toString(),
      subject: req.body.subject,
      user: req.user._id.toString(),
    };
    item.metadata = { ...item.metadata, ...metadata };
    return item;
  });

  if (pineconeIndex) {
    await PineconeStore.fromDocuments(
      output,
      new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      }),
      {
        pineconeIndex,
      }
    );
  }

  res.send(note);
});

const createVideoFileNote = catchAsync(async (req, res) => {
  req.body.user = req.user._id;
  req.body.type = noteTypes.VIDEO;
  const note = await noteService.createNote(req.body);

  // Transcribe
  const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY,
  });

  const FILE_URL = req.body.url;

  const data = {
    audio_url: FILE_URL,
  };
  console.log(
    'STARTING VIDEO FILE',
    {
      apiKey: process.env.ASSEMBLYAI_API_KEY,
    },
    note
  );
  console.log({ data });
  const transcript = await client.transcripts.create(data);
  console.log({ transcript });
  const transcription = transcript.text;

  await pineconeService.initialize();

  const pineconeIndex = pineconeService.pinecone.Index(process.env.PDB_INDEX || '');
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 200,
  });
  let output = await splitter.createDocuments([transcription]);
  // output[0].metadata.note = note._id.toString();
  output = output.map((_item, index) => {
    const item = { ..._item };
    const metadata = {
      pageNum: index + 1,
      text: transcription,
      note: note._id.toString(),
      subject: req.body.subject,
      user: req.user._id.toString(),
    };
    item.metadata = { ...item.metadata, ...metadata };
    return item;
  });

  if (pineconeIndex) {
    await PineconeStore.fromDocuments(
      output,
      new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      }),
      {
        pineconeIndex,
      }
    );
  }

  res.send(note);
});

const createAudioFileNote = catchAsync(async (req, res) => {
  req.body.user = req.user._id;
  req.body.type = noteTypes.AUDIO;
  const note = await noteService.createNote(req.body);

  // Transcribe
  const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY,
  });

  const FILE_URL = req.body.url;

  const data = {
    audio_url: FILE_URL,
  };

  const transcript = await client.transcripts.create(data);
  const transcription = transcript.text;

  await pineconeService.initialize();

  const pineconeIndex = pineconeService.pinecone.Index(process.env.PDB_INDEX || '');
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 200,
  });
  let output = await splitter.createDocuments([transcription]);
  // output[0].metadata.note = note._id.toString();
  output = output.map((_item, index) => {
    const item = { ..._item };
    const metadata = {
      pageNum: index + 1,
      text: transcription,
      note: note._id.toString(),
      subject: req.body.subject,
      user: req.user._id.toString(),
    };
    item.metadata = { ...item.metadata, ...metadata };
    return item;
  });

  if (pineconeIndex) {
    await PineconeStore.fromDocuments(
      output,
      new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      }),
      {
        pineconeIndex,
      }
    );
  }

  res.send(note);
});

const createUrlNote = catchAsync(async (req, res) => {
  const { url } = req.body;

  const { data } = await axios.get(url);

  const $ = cheerio.load(data);
  const transcription = $('body').text();

  // Create new note
  req.body.user = req.user._id;
  req.body.type = noteTypes.URL;
  const note = await noteService.createNote(req.body);
  await pineconeService.initialize();

  const pineconeIndex = pineconeService.pinecone.Index(process.env.PDB_INDEX || '');
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 200,
  });
  let output = await splitter.createDocuments([transcription]);
  // output[0].metadata.note = note._id.toString();
  output = output.map((_item, index) => {
    const item = { ..._item };
    const metadata = {
      pageNum: index + 1,
      text: transcription,
      note: note._id.toString(),
      subject: req.body.subject,
      user: req.user._id.toString(),
    };
    item.metadata = { ...item.metadata, ...metadata };
    return item;
  });

  if (pineconeIndex) {
    await PineconeStore.fromDocuments(
      output,
      new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      }),
      {
        pineconeIndex,
      }
    );
  }

  res.send(note);
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

const createYoutubeNote = catchAsync(async (req, res) => {
  const { url } = req.body;

  // ytdl(url).pipe(fs.createWriteStream('video.mp4'));

  const youtubeInfo = await ytdl.getInfo(url);

  const formats = Array.isArray(youtubeInfo.formats) ? youtubeInfo.formats : [];

  const audioFile = formats.find((format) => (format.mimeType || '').includes('audio/mp4'));

  req.body.user = req.user._id;
  req.body.type = noteTypes.YOUTUBE;
  const note = await noteService.createNote(req.body);

  // Transcribe
  const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY,
  });

  const FILE_URL = audioFile.url;

  const data = {
    audio_url: FILE_URL,
  };

  const transcript = await client.transcripts.create(data);
  const transcription = transcript.text;

  await pineconeService.initialize();

  const pineconeIndex = pineconeService.pinecone.Index(process.env.PDB_INDEX || '');
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 200,
  });
  let output = await splitter.createDocuments([transcription]);
  // output[0].metadata.note = note._id.toString();
  output = output.map((_item, index) => {
    const item = { ..._item };
    const metadata = {
      pageNum: index + 1,
      text: transcription,
      note: note._id.toString(),
      subject: req.body.subject,
      user: req.user._id.toString(),
    };
    item.metadata = { ...item.metadata, ...metadata };
    return item;
  });

  if (pineconeIndex) {
    await PineconeStore.fromDocuments(
      output,
      new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      }),
      {
        pineconeIndex,
      }
    );
  }

  res.send(note);

  res.send('ok');
});

const getNotes = catchAsync(async (req, res) => {
  const { filter, options } = queryParser(req.query);
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
};
