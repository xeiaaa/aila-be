const { AssemblyAI } = require('assemblyai');

const transcribe = async (fileUrl) => {
  const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY,
  });

  const data = {
    audio_url: fileUrl,
  };

  const transcript = await client.transcripts.create(data);
  return transcript.text;
};

module.exports = transcribe;
