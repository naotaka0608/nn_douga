const express = require('express');
const router = express.Router();
const config = require('../config');
const apiTokenGenerator = require('./apiTokenGenerator');

router.get('/', function(req, res, next) {
  let email = '';
  let apiToken = '';
  if (req.user) {
    email = req.user.email;
    apiToken = apiTokenGenerator(req.user.userId, 60 * 60 * 24);
  }
  res.render('index', {
    email: email,
    apiToken: apiToken,
    user: req.user,
    config: config
  });
});

module.exports = router;