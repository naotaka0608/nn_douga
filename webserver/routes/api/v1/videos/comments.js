const express = require('express');
const router = express.Router();
const apiTokenDecoder = require('../../../apiTokenDecoder');
const apiTokenEnsurer = require('../../../apiTokenEnsurer');
const config = require('../../../../config');
const Comment = require('../../../../models/comment');
const VideoStatistic = require('../../../../models/videostatistic');

router.get('/:videoId/comments', apiTokenEnsurer, (req, res, next) => {
      const decodedApiToken = apiTokenDecoder(req);
    
      if (decodedApiToken) {
        const videoId = req.params.videoId;
        Comment.findAll({
          where: {
            videoId: videoId
          },
          order: [['videoPosition', 'ASC']]
        })
          .then(comments => {
            res.json(comments);
          })
          .catch(e => {
            console.error(e);
            res.json({ status: 'NG', message: 'Database error.' });
          });
      } else {
        res.json({ status: 'NG', message: 'Api token not correct.' });
      }
    });
    

router.post('/:videoId/comments', apiTokenEnsurer, (req, res, next) => {
  const decodedApiToken = apiTokenDecoder(req);

  if (decodedApiToken) {
    const content = req.body.content;
    const videoPosition = req.body.videoPosition;
    const videoId = req.params.videoId;
    const userId = decodedApiToken.userId;

    Comment.create({
      content: content.substring(0, 255),
      videoPosition: videoPosition,
      videoId: videoId,
      userId: userId
    })
      .then(comment => {
        return VideoStatistic.increment('commentCount', {
          where: { videoId: videoId }
        }).then(() => {
          res.json({
            status: 'OK',
            message: 'Comment posted.',
            comment: comment
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