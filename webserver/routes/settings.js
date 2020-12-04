const express = require('express');
const moment = require('moment');
const router = express.Router();
const apiTokenGenerator = require('./apiTokenGenerator');
const authenticationEnsurer = require('./authenticationEnsurer');
const config = require('../config');
const User = require('../models/user');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

router.get('/', authenticationEnsurer, csrfProtection, (req, res, next) => {
  let email = '';
  if (req.user) {
    email = req.user.email;
  }

  User.findOne({
    where: {
      userId: req.user.userId
    }
  }).then(user => {
    const formattedCreatedAt = moment(user.createdAt).format(
      'YYYY/MM/DD HH:mm'
    );

    const formattedUpdatedAt = moment(user.updatedAt).format(
      'YYYY/MM/DD HH:mm'
    );

    res.render('settings', {
      email: email,
      config: config,
      user: user,
      formattedCreatedAt: formattedCreatedAt,
      formattedUpdatedAt: formattedUpdatedAt,
      csrfToken: req.csrfToken()
    });
  });
});

router.post('/', authenticationEnsurer, csrfProtection, (req, res, next) => {
      const userName = req.body.userName;
    
      User.findOne({
        where: {
          userId: req.user.userId
        }
      }).then(user => {
        User.update(
          {
            userName: userName.substring(0, 255)
          },
          {
            where: {
              userId: req.user.userId
            }
          }
        ).then(() => {
          res.redirect('/settings');
        });
      });
    });


module.exports = router;