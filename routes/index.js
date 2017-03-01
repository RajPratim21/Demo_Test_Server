/**
 * Created by Benjamin on 10/13/2016.
 */

var express = require('express');
var passport = require('passport');
var router = express.Router();
var app = require('../app');
var clientIdAuthIdMap = require('../clientIdAuthIdMap/clientIdAuthIdMap').clientIdAuthIdMap;
// var g = require('../g');
var current_user;
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/chat', function (req, res, next) {
  res.render('chat', { title: 'Express' });
});


router.get('/login', function (req, res, next) {
  res.render('login.ejs', { message: req.flash('loginMessage') });
});

router.get('/signup', function (req, res) {
  res.render('signup.ejs', { message: req.flash('loginMessage') });
});

router.get('/profile', isLoggedIn, function (req, res) {
  res.render('profile.ejs', { user: req.user });
});

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true
}));

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/profile',
  failureRedirect: '/'
}));

router.get('/auth/twitter', passport.authenticate('twitter'));

router.get('/auth/twitter/callback', passport.authenticate('twitter', {
  successRedirect: '/profile',
  failureRedirect: '/'
}));

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: '/'}),
    function (req, res) {
      console.log(req.user);
        // gDocId = req.user.id;
        // console.log("id: "+gDocId);.
      console.log('Auth user.name: ' + req.user.name);
      console.log('get client id and user id ', req.sessionID);
      req.session.user = req.user;
        current_user = req.user;
        console.log('><%%%%%%%%%@@@@@@@@@@@_-----------'+current_user);
        module.exports = current_user;
        // key => Auth id, value => websocket session id
        // clientIdAuthIdMap.push(req.user.clientid,req.user.sessionToken);
      console.log('Adding this pair to the map: ' + req.user.clientid + ' <=> ' + req.user.sessionToken);
        // res.redirect('/');
      res.redirect('/chat');
        // res.app.loginProcess(req.user.google.name, req, res);
    });

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}
