/*
/!**
 * Created by RajPratim on 10/13/2016.
 */
var Cloudant = require('cloudant');
var cloudant = Cloudant({account: process.env.LOG_USER, password: process.env.LOG_PASS});

var User = {
  findOne: function (_id, done)
    {
    var db = cloudant.use(process.env.DATABASE_NAME);

    console.log('Clientid: ' + _id);
    db.find({selector: {'_id': _id}},
            function (err, result) {
              if (err) {
                console.log('There was an error finding the user: ' + err);
                    // return done(null, false, JSON.stringify({"reason":"There was an error connecting to the database"}));
                return done(null, false, { message: 'There was an error connecting to the database' } );
              }
              if (result.docs.length == 0) {
                console.log('Username was not found');
                    // var user ={_id:""}
                var userDetails = new (require('./userDetails'))();// User._id = clientid; ///TODO: This must be a complete user details object....
                    // var userDetails = new Details();
                console.log(userDetails);
                userDetails._id = _id;
                console.log(userDetails);
                delete userDetails._rev;
                db.insert(userDetails, function (err, body) {
                  if (err) {
                    console.log('error: ' + err);
                    console.log('error: ' + JSON.stringify(err));
                    return done(null, false, {message: 'Could not add user...'});
                  }
                  else
                            done(null, userDetails);
                });
                    // return done(null, false, { message : "Username was not found" } );
              }
              else {
                var userDetails = result.docs[0];
                done(null, userDetails);
              }
            });
  },

  findById: function (_id, done)
    {
    var db = cloudant.use(process.env.DATABASE_NAME);
    db.find({selector: {'_id': _id}},
            function (err, result) {
              if (err) {
                console.log('There was an error finding the user: ' + err);
                    // return done(null, false, JSON.stringify({"reason":"There was an error connecting to the database"}));
                return done(null, false, { message: 'There was an error connecting to the database' } );
              }
              if (result.docs.length == 0) {
                console.log('Username was not found');
                return done(null, false, { message: 'Username was not found' } );
              }

              var user = result.docs[0];
              return done(null, user);
            });
  }

};

module.exports = User;
