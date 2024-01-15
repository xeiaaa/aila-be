const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { PineconeStore } = require('langchain/vectorstores/pinecone');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { pineconeService } = require('../../services');

const embedText = async (note) => {
  await pineconeService.initialize();

  const pineconeIndex = pineconeService.pinecone.Index(process.env.PDB_INDEX || '');
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 200,
  });
  let output = await splitter.createDocuments([note.transcription]);

  output = output.map((_item, index) => {
    const item = { ..._item };
    const metadata = {
      pageNum: index + 1,
      text: note.transcription,
      note: note._id.toString(),
      subject: note.subject ? note.subject.toString() : undefined,
      user: note.user.toString(),
    };
    item.metadata = { ...item.metadata, ...metadata };
    return item;
  });

  if (pineconeIndex) {
    try {
      await PineconeStore.fromDocuments(
        output,
        new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        }),
        {
          pineconeIndex,
        }
      );
    } catch (error) {
      console.log({ ERROR_EMBED: error });
    }
  }
};

module.exports = embedText;
