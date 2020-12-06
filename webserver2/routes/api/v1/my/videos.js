const express = require('express');
const router = express.Router();
const apiTokenDecoder = require('../../../apiTokenDecoder');
const apiTokenEnsurer = require('../../../apiTokenEnsurer');
const config = require('../../../../config');
const Video = require('../../../../models/video');
const User = require('../../../../models/user');
const loader = require('../../../../models/sequelizeLoader');
const Sequelize = loader.Sequelize;
const Op = Sequelize.Op;

router.get('/videos', apiTokenEnsurer, (req, res, next) => {
  const decodedApiToken = apiTokenDecoder(req);

  if (decodedApiToken) {
    User.findOne({
      where: { userId: decodedApiToken.userId }
    })
      .then(user => {
        let whereCondition = {
          userId: user.userId,
          videoStatus: { [Op.ne]: 'Deleted' }
        };

        // 管理者の場合は、削除されていない全動画を表示
        if (user.isAdmin) {
          whereCondition = {
            videoStatus: { [Op.ne]: 'Deleted' }
          };
        }

        return Video.findAll({
          where: whereCondition,
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

module.exports = router;