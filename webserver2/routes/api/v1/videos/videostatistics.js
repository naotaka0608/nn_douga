const express = require('express');
const router = express.Router();
const apiTokenDecoder = require('../../../apiTokenDecoder');
const apiTokenEnsurer = require('../../../apiTokenEnsurer');
const config = require('../../../../config');
const VideoStatistic = require('../../../../models/videostatistic');

router.get('/:videoId/videostatistics', apiTokenEnsurer, (req, res, next) => {
  const decodedApiToken = apiTokenDecoder(req);

  if (decodedApiToken) {
    const videoId = req.params.videoId;

    VideoStatistic.findOrCreate({
      where: { videoId: videoId },
      defaults: {
        videoId: videoId,
        playCount: 0,
        commentCount: 0,
        myListCount: 0
      }
    })
      .spread((videoStatistic, isCreated) => {
        res.json(videoStatistic);
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