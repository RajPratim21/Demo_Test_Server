/**
 * Created by Rajpratim on 10/13/2016.
 */

// var LocalStrategy = require('passport-local').Strategy;
// var FacebookStrategy = require('passport-facebook').Strategy;
// var TwitterStrategy = require('passport-twitter').Strategy;

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models/user');
var configAuth = require('./auth');
var bcrypt = require('bcrypt');
var Cloudant = require('cloudant');
var cloudant = Cloudant({account: process.env.LOG_USER, password: process.env.LOG_PASS});
// add a new API which allows us to retrieve the logs (note this is not secure)
var dbName = process.env.DATABASE_NAME;


module.exports = function (passport) {
  passport.serializeUser(function (user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  passport.use(new GoogleStrategy({
    clientID: configAuth.googleAuth.clientID,
    clientSecret: configAuth.googleAuth.clientSecret,
    callbackURL: configAuth.googleAuth.callbackURL
  },
        function (token, refreshToken, profile, done) {
          process.nextTick(function () {
            User.findOne(profile.id, function (err, user) {
              console.log('-----------------------------------USER FINDING----------------------');
              if (err)
                console.log('Error in findOne');

              if (!err)
                console.log('Token: ' + token);
              console.log(user);
              user.name = profile.name.givenName;
              user.familyname = profile.name.familyName;
              user.displayname = profile.displayName;
              user.email = profile.emails;
              user.clientid = profile.id;
              user.gender = profile.gender;
              user.sessionToken = token;
              return done(null, user);
            });
          });

                /* var db = cloudant.use('testauth');

                console.log(profile)
                db.find({selector:{"clientid":profile.id}},
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
            });*/
        }
    ));
};
