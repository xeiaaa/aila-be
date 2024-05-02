const { default: axios } = require('axios');
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { mediaService } = require('../services');
const ApiError = require('../utils/ApiError');

const generateHeyGenVideo = catchAsync(async (req, res) => {
  try {
    const { photoId, summary, voiceId } = req.body;
    const requestData = {
      video_inputs: [
        {
          character: {
            type: 'talking_photo',
            talking_photo_id: photoId,
          },
          voice: {
            type: 'text',
            input_text: summary,
            voice_id: voiceId,
          },
          background: {
            type: 'color',
            value: '#FAFAFA',
          },
        },
      ],
      test: true,
      dimension: {
        width: 1280,
        height: 720,
      },
      aspect_ratio: null,
    };
    const response = await axios.post(process.env.GENERATE_VIDEO_URL, requestData, {
      headers: {
        'X-Api-Key': process.env.HEYGEN_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    res.status(httpStatus.CREATED).send(response.data);
  } catch (error) {
    console.info({ error });
    return res.status(400).send('Unprocessed file', error);
  }
});

const getVideoStatus = catchAsync(async (req, res) => {
  try {
    const { mediaId } = req.params;
    const media = await mediaService.getMediaById(mediaId);
    if (!media) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Media not found');
    }
    const response = await axios.get(`${process.env.VIDEO_STATUS}?video_id=${media.metaData.videoId}`, {
      headers: {
        'X-Api-Key': process.env.HEYGEN_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (response.data.data.status === 'completed') {
      media.metaData = {
        ...media.metaData,
        data: response.data.data,
      };
      media.url = response.data.data.video_url;
    }
    await media.save();
    res.send(response.data.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get video status', details: error.message });
  }
});

module.exports = {
  generateHeyGenVideo,
  getVideoStatus,
};
