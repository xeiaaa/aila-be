const { PineconeClient } = require('@pinecone-database/pinecone');

const pinecone = new PineconeClient();

const initialize = async () => {
  await pinecone.init({
    environment: process.env.PDB_ENV,
    apiKey: process.env.PDB_KEY,
  });
  console.log('pinecone initialized');
};

module.exports = {
  initialize,
  pinecone,
};
