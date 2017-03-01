/**
 * Created by RajPratim on 10/13/2016.
 */

// / Client ID 637039483736-a3ofgtbjo0raelu5dr565gr4s89chg83.apps.googleusercontent.com
// Client secret 44H7OGltI1-WNexq8Pdfu6uJ
module.exports = {
  facebookAuth: {
    clientID: 'clientID', 
    clientSecret:  'clientSecret'
    callbackURL: 'http://localhost:3000/auth/facebook/callback'
  },
  twitterAuth: {
    consumerKey: 'consumerKey',
    consumerSecret: 'consumerSecret',
    callbackURL: 'http://localhost:3000/auth/twitter/callback'
  },
  googleAuth: {
    clientID: 'clientID',
    clientSecret: 'clientSecret',
    //callbackURL: 'http://localhost:3000/auth/google/callback'
    callbackURL: '/auth/google/callback'
  }
};
