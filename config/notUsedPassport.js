/*
/!**
 * 

var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models/user');
var configAuth = require('./auth');
var bcrypt = require('bcrypt');
var Cloudant = require('cloudant');
var cloudant = Cloudant({account:process.env.LOG_USER, password:process.env.LOG_PASS});
// add a new API which allows us to retrieve the logs (note this is not secure)
var dbName = process.env.DATABASE_NAME;


module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.clientid);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true,
        },
        function(req, email, password, done) {
            process.nextTick(function() {
                User.findOne({ 'local.email':  email }, function(err, user) {
                    if (err)
                        return done(err);
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {
                        var newUser = new User();
                        newUser.local.email = email;
                        newUser.local.password = newUser.generateHash(password);
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            });
        }));

    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true,
        },
        function(req, email, password, done) {
            User.findOne({ 'local.email':  email }, function(err, user) {
                if (err)
                    return done(err);
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'));
                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                return done(null, user);
            });
        }));

    passport.use(new FacebookStrategy({
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackURL,
            profileFields: ['id', 'email', 'first_name', 'last_name'],
        },
        function(token, refreshToken, profile, done) {
            process.nextTick(function() {
                User.findOne({ 'facebook.id': profile.id }, function(err, user) {
                    if (err)
                        return done(err);
                    if (user) {
                        return done(null, user);
                    } else {
                        var newUser = new User();
                        newUser.facebook.id = profile.id;
                        newUser.facebook.token = token;
                        newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();

                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            });
        }));

    passport.use(new TwitterStrategy({
            consumerKey: configAuth.twitterAuth.consumerKey,
            consumerSecret: configAuth.twitterAuth.consumerSecret,
            callbackURL: configAuth.twitterAuth.callbackURL,
        },
        function(token, tokenSecret, profile, done) {
            process.nextTick(function() {
                User.findOne({ 'twitter.id': profile.id }, function(err, user) {
                    if (err)
                        return done(err);
                    if (user) {
                        return done(null, user);
                    } else {
                        var newUser = new User();
                        newUser.twitter.id          = profile.id;
                        newUser.twitter.token       = token;
                        newUser.twitter.username    = profile.username;
                        newUser.twitter.displayName = profile.displayName;
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            });
        }));

    passport.use(new GoogleStrategy({
            clientID: configAuth.googleAuth.clientID,
            clientSecret: configAuth.googleAuth.clientSecret,
            callbackURL: configAuth.googleAuth.callbackURL,
        },
        function(token, refreshToken, profile, done) {
            process.nextTick(function () {

                var db = cloudant.use('testauth');
                db.find({selector:{"clientid":1}},
                    function(err, result) {
                        if (err){
                            console.log("There was an error finding the user: " + err);
                            //return done(null, false, JSON.stringify({"reason":"There was an error connecting to the database"}));
                            return done(null, false, { message : "There was an error connecting to the database" } );
                        }
                        if (result.docs.length == 0){
                            console.log("Username was not found");
                            return done(null, false, { message : "Username was not found" } );
                        }

                        var user = result.docs[0];
                        return done(null, user);

                    })
            });
        }


        /!*passport.use(new GoogleStrategy({
         clientID: configAuth.googleAuth.clientID,
         clientSecret: configAuth.googleAuth.clientSecret,
         callbackURL: configAuth.googleAuth.callbackURL,
         },
         function(token, refreshToken, profile, done) {
         process.nextTick(function () {
         return done(null, profile);
         });
         }*!/
        /!*            process.nextTick(function() {
         User.findOne({ 'google.id': profile.id }, function(err, user) {
         if (err)
         return done(err);
         if (user) {
         return done(null, user);
         } else {
         var newUser = new User();
         newUser.google.id = profile.id;
         newUser.google.token = token;
         newUser.google.name = profile.displayName;
         newUser.google.email = profile.emails[0].value;
         newUser.save(function(err) {
         if (err)
         throw err;
         return done(null, newUser);
         });
         }
         });
         });
         }*!/

    ));

};
*/
