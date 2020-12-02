var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var helmet = require('helmet');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var config = require('./config');
var passwordDigestClient = require('./routes/passwordDigestClient');

// モデルの読み込みとテーブルの作成
var User = require('./models/user');
var Video = require('./models/video');
var Comment = require('./models/comment');
var Mylistitem = require('./models/mylistitem');
var VideoStatistic = require('./models/videostatistic');
User.sync().then(() => {
  Video.belongsTo(User, { foreignKey: 'userId' });
    Video.sync().then(() => {    
      Comment.belongsTo(Video, { foreignKey: 'videoId' });
      Comment.sync();
      Video.belongsTo(VideoStatistic, { foreignKey: 'videoId' });
      VideoStatistic.sync();
    });
    Mylistitem.belongsTo(User, { foreignKey: 'userId' });
    Mylistitem.sync();
  }
);

var indexRouter = require('./routes/index');
var login = require('./routes/login');
var logout = require('./routes/logout');
var usersRouter = require('./routes/users');

var app = express();

app.use(helmet());

// パスポートの設定
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    function(email, password, done) {
      // if (email === 'soichiro_yoshimura@nnn.ed.jp' && password == 'test') {
      //   done(null, { email, password });
      // } else {
      //   done(null, false, { message: 'パスワードが違います' });
      // }
      // passwordDigestClient
      //   .verify(
      //     password,
      //     '$2a$15$zpLyTVbAIYURo5v/W2IWy.nasRQ/IDQCLKH/iDHHe8N5xUynbT33O'
      //   )
      //   .then(isCorrect => {
      //     if (email === 'soichiro_yoshimura@nnn.ed.jp' && isCorrect) {
      //       done(null, { email, password });
      //     } else {
      //       done(null, false, { message: 'パスワードが違います' });
      //     }
      //   });
      User.findOne({
          where: {
            email: email
          }
        }).then(user => {
          if (!user) {
            done(null, false, {
              message: '登録されたメールアドレスではありません'
            });
          } else {
            passwordDigestClient
              .verify(
                password,
                user.passwordDigest
                //'$2a$15$zpLyTVbAIYURo5v/W2IWy.nasRQ/IDQCLKH/iDHHe8N5xUynbT33O'
              )
              .then(isCorrect => {
                //if (email === 'soichiro_yoshimura@nnn.ed.jp' && isCorrect) {
                if (isCorrect) {
                  done(null, { email, password });
                } else {
                  done(null, false, { message: 'パスワードが違います' });
                }
              });
          }
        });
    }
  )
);

passport.serializeUser(function(user, done) {
  // done(null, user);
  User.findOne({
    where: {
      email: user.email
    }
  }).then(storedUser => {
    user.userId = storedUser.userId;
    user.userName = storedUser.userName;
    user.isEmailVerified = storedUser.isEmailVerified;
    user.isAdmin = storedUser.isAdmin;
    delete user.password; // パスワードプロパティはハッシュにして保存しているので削除する
    done(null, user);
  });
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.use(
  session({
    store: new RedisStore({
      host: config.REDIS_HOST,
      port: config.REDIS_PORT
    }),
    secret: config.SECRET,
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/login', login);
app.use('/logout', logout);
app.use('/users', usersRouter);

app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: false
  })
);
  

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
