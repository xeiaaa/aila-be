const httpStatus = require('http-status');
const aws = require('aws-sdk');
const catchAsync = require('../utils/catchAsync');
const { uploadService } = require('../services');

const bucketName = process.env.AWS_BUCKET;
const s3Data = {
  accessKeyId: process.env.AWS_S3_ACCESS_KEY,
  secretAccessKey: process.env.AWS_S3_SECRET,
  region: process.env.AWS_REGION,
  signatureVersion: 'v4',
};

const s3 = new aws.S3(s3Data);

const getSignedUrl = catchAsync(async (req, res) => {
  const { fileName, fileType } = req.query;

  const extension = fileName.slice(fileName.lastIndexOf('.'));
  const fileNameWithoutExtension = fileName.slice(0, fileName.lastIndexOf('.'));

  const newFileName = `${fileNameWithoutExtension}-${+new Date()}${extension}`;

  const params = {
    Bucket: bucketName,
    Key: newFileName,
    ContentType: fileType,
  };

  s3.getSignedUrl('putObject', params, (err, data) => {
    if (err) {
      return res.end();
    }

    const response = {
      signedRequest: data,
      url: `https://${bucketName}.s3.amazonaws.com/${newFileName}`,
    };
    res.send(response);
  });
});

const createUpload = catchAsync(async (req, res) => {
  req.body.user = req.user._id;
  const upload = await uploadService.createUpload(req.body);
  res.status(httpStatus.CREATED).send(upload);
});

const getUserUploads = catchAsync(async (req, res) => {
  const user = req.user._id;
  const filter = { user };
  const result = await uploadService.queryUploads(filter, { limit: 100 });
  res.send(result);
});

module.exports = {
  getSignedUrl,
  createUpload,
  getUserUploads,
};
