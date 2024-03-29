const express = require('express');
const authRoute = require('./auth.route');
const avatarRoute = require('./avatar.route');
const userRoute = require('./user.route');
const postRoute = require('./post.route');
const docsRoute = require('./docs.route');
const sampleRoute = require('./sample.route');
const uploadRoute = require('./upload.route');
const dividerRoute = require('./divider.route');
const subjectRoute = require('./subject.route');
const noteRoute = require('./note.route');
const messageRoute = require('./message.route');
const mediaRoute = require('./media.route');
const talkingPhotoRoute = require('./talkingPhoto.route');
const heygenRoute = require('./heygen.route');

const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/avatars',
    route: avatarRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/uploads',
    route: uploadRoute,
  },
  {
    path: '/posts',
    route: postRoute,
  },
  {
    path: '/dividers',
    route: dividerRoute,
  },
  {
    path: '/subjects',
    route: subjectRoute,
  },
  {
    path: '/notes',
    route: noteRoute,
  },
  {
    path: '/messages',
    route: messageRoute,
  },
  {
    path: '/talkingPhotos',
    route: talkingPhotoRoute,
  },
  {
    path: '/medias',
    route: mediaRoute,
  },
  {
    path: '/heygens',
    route: heygenRoute,
  },
  {
    path: '/sample',
    route: sampleRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
