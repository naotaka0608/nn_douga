const express = require('express');
const moment = require('moment');
const router = express.Router();
const config = require('../config');
const authenticationEnsurer = require('./authenticationEnsurer');
const apiTokenGenerator = require('./apiTokenGenerator');
const Video = require('../models/video');
const User = require('../models/user');
const VideoStatistic = require('../models/videostatistic');
const loader = require('../models/sequelizeLoader');
const Sequelize = loader.Sequelize;

router.get('/:videoId', authenticationEnsurer, (req, res, next) => {
  const videoId = req.params.videoId;
  let email = '';
  let apiToken = '';
  if (req.user) {
    email = req.user.email;
    apiToken = apiTokenGenerator(req.user.userId, 60 * 60 * 24);
  }

  Video.findOne({
    include: [
      {
        model: User,
        attributes: [
          'userId',
          'email',
          'userName',
          'isEmailVerified',
          'isAdmin'
        ]
      }
    ],
    where: {
      videoId: videoId,
      videoStatus: 'Published'
    }
  }).then(video => {
    if (video) {
      return VideoStatistic.increment('playCount', {
        where: { videoId: videoId }
      }).then(() => {
        const formattedCreatedAt = moment(video.createdAt).format(
          'YYYY/MM/DD HH:mm'
        );
        res.render('watch', {
          config: config,
          video: video,
          formattedCreatedAt: formattedCreatedAt,
          user: req.user,
          email: email,
          apiToken: apiToken
        });
      });
    } else {
      res.render('notfoundvideo', {
        config: config,
        user: req.user
      });
    }
  });
});

module.exports = router;