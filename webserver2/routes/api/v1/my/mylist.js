const express = require('express');
const router = express.Router();
const apiTokenDecoder = require('../../../apiTokenDecoder');
const apiTokenEnsurer = require('../../../apiTokenEnsurer');
const config = require('../../../../config');
const Mylistitem = require('../../../../models/mylistitem');
const Video = require('../../../../models/video');
const VideoStatistic = require('../../../../models/videostatistic');
const loader = require('../../../../models/sequelizeLoader');
const Sequelize = loader.Sequelize;
const Op = Sequelize.Op;

router.post('/', apiTokenEnsurer, (req, res, next) => {
  const decodedApiToken = apiTokenDecoder(req);

  if (decodedApiToken) {
    const videoId = req.body.videoId;
    Mylistitem.create({
      videoId: videoId,
      userId: decodedApiToken.userId
    })
      .then(mylistitem => {
        return VideoStatistic.increment('myListCount', {
          where: { videoId: videoId }
        }).then(() => {
          res.json({
            status: 'OK',
            message: 'Mylistitem created.',
            mylistitem: mylistitem
          });
        });
      })
      .catch(e => {
        console.error(e);
        res.json({ status: 'NG', message: 'Database error.' });
      });
  } else {
    res.json({ status: 'NG', message: 'Api token not correct.' });
  }
});

router.get('/', apiTokenEnsurer, (req, res, next) => {
  const decodedApiToken = apiTokenDecoder(req);

  if (decodedApiToken) {
    Mylistitem.findAll({
      where: {
        userId: decodedApiToken.userId
      },
      order: [['createdAt', 'DESC']]
    })
      .then(mylistitem => {
        const videoIds = mylistitem.map(i => i.videoId);
        return Video.findAll({
          where: {
            videoId: { [Op.in]: videoIds }
          },
          order: [['createdAt', 'DESC']]
        }).then(videos => {
          res.json(videos);
        });
      })
      .catch(e => {
        console.error(e);
        res.json({ status: 'NG', message: 'Database error.' });
      });
  } else {
    res.json({ status: 'NG', message: 'Api token not correct.' });
  }
});

router.delete('/', apiTokenEnsurer, (req, res, next) => {
  const decodedApiToken = apiTokenDecoder(req);
  const videoId = req.body.videoId;

  if (decodedApiToken) {
    Mylistitem.destroy({
      where: {
        userId: decodedApiToken.userId,
        videoId: videoId
      }
    })
      .then(() => {
        return VideoStatistic.findById(videoId).then(videoStatistic => {
          return videoStatistic.decrement('myListCount', { by: 1 }).then(() => {
            res.json({ status: 'OK', message: 'Mylistitem deleted.' });
          });
        });
      })
      .catch(e => {
        console.error(e);
        res.json({ status: 'NG', message: 'Database error.' });
      });
  } else {
    res.json({ status: 'NG', message: 'Api token not correct.' });
  }
});

module.exports = router;