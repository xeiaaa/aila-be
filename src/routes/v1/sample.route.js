const express = require('express');
const { AssemblyAI } = require('assemblyai');

const router = express.Router();

router.get('/file-to-text', async (req, res) => {
  const client = new AssemblyAI({
    apiKey: '66dbbe4febbb4904be75d935629a01c3',
  });

  const FILE_URL =
    'https://devx-images.s3.ap-southeast-1.amazonaws.com/Joseph+Prince+-+The+Lord+makes+your+brokenness+beautiful.mp4';

  const data = {
    audio_url: FILE_URL,
  };

  const transcript = await client.transcripts.create(data);

  res.json({
    transcript,
  });
});

module.exports = router;
