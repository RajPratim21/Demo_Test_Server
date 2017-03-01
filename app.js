/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


'use strict';

require('dotenv').config({ silent: true });
var express = require('express');
var compression = require('compression');
var bodyParser = require('body-parser');  // parser for post requests
var watson = require('watson-developer-cloud');
//The following requires are needed for logging purposes
var uuid = require('uuid');
var csv = require('express-csv');
var vcapServices = require('vcap_services');
var basicAuth = require('basic-auth-connect');
var async = require('async');
var endOfLine = require('os').EOL;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var passport = require('passport');

var flash = require('connect-flash');
//var mongoose = require('mongoose');
//var configDB = require('./config/database.js');
//mongoose.connect(configDB.url);
var session = require('express-session');

//var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
//The app owner may optionally configure a cloudand db to track user input.
//This cloudand db is not required, the app will operate without it.
//If logging is enabled the app must also enable basic auth to secure logging
//endpoints

/// Cloudant DB helper functions
var buildUpUserDetails = require('./cloudantAPI/cloudantAccessPoint').buildUpUserDetails;
var getContextForUser = require('./cloudantAPI/cloudantAccessPoint').getContextForUser;
var buildUpUserInteraction = require('./cloudantAPI/cloudantAccessPoint').buildUpDayUserInteractions;
var pointScheme = require('./models/bennitScoreSystem');
//var clientIdAuthIdMap = require('./clientIdAuthIdMap/clientIdAuthIdMap').clientIdAuthIdMap;

/// Retrieve and Rank
var retrieve_and_rank = watson.retrieve_and_rank({
  username: process.env.RANKRETRIEVE_USERNAME,
  password: process.env.RANKRETRIEVE_PASSWORD,
  version: 'v1'
});

var retrieve_and_rank_params = {
  cluster_id: process.env.RANKRETRIEVE_CLUSTER_ID,
  collection_name: process.env.RANKRETRIEVE_COLLECTION_NAME
};

/// Database credentials
var cloudantCredentials = vcapServices.getCredentials('cloudantNoSQLDB');
var cloudantUrl = null;
if (cloudantCredentials) {
  cloudantUrl = cloudantCredentials.url;
}
cloudantUrl = cloudantUrl || process.env.CLOUDANT_URL; // || '<cloudant_url>';

//The conversation workspace id
var workspace_id = process.env.WORKSPACE_ID || '<workspace_id>';
var cloudantDb = null;
var cloudantLookup = require('./cloudantAPI/cloudantDBAPI');
var bennitscoremap = require('./models/bennitscoremap');
var request = require('request')
/// Create the app
var app = module.exports = express();
require('./config/passport')(passport);
//var routes = require('./routes/index');
var users = require('./routes/users');

app.use(session({ secret: 'shhsecret', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
//app.use('/', routes);

//app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/users', users);
var gDocId = "none";
//var g = module.exports = gDocId();

app.g = "";

//-------------------------------------------------------------------------------------------------------


var express = require('express');
var passport = require('passport');
var router = express.Router();
//var app = require('../app');
var clientIdAuthIdMap = require('./clientIdAuthIdMap/clientIdAuthIdMap').clientIdAuthIdMap;
// var g = require('../g');
var current_user;
app.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

app.get('/chat', function (req, res, next) {
  res.render('chat', { title: 'Express' });
});


app.get('/login', function (req, res, next) {
  res.render('login.ejs', { message: req.flash('loginMessage') });
});

app.get('/signup', function (req, res) {
  res.render('signup.ejs', { message: req.flash('loginMessage') });
});

app.get('/profile', isLoggedIn, function (req, res) {
  res.render('profile.ejs', { user: req.user });
});

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

app.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true
}));

app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/profile',
  failureRedirect: '/'
}));

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback', passport.authenticate('twitter', {
  successRedirect: '/profile',
  failureRedirect: '/'
}));

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: '/'}),
    function (req, res) {
      //change made
      setupResponseFunctions();
      console.log(req.user);
        // gDocId = req.user.id;
        // console.log("id: "+gDocId);.
      console.log('Auth user.name: ' + req.user.name);
      console.log('get client id and user id ', req.sessionID);
      req.session.user = req.user;
        current_user = req.user;
        console.log('><%%%%%%%%%@@@@@@@@@@@_-----------'+current_user);
        //module.exports = current_user;
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

//---------------------------------------------------------------------------------------------------------



//app.use ( compression () );
//***************************************************************************************************
//routes for FB authentication added by RAJ PRATIM BHattacharya
//Created By Raj Pratim Bhattacharya on 04/02/17 rajpratim1234@gmail.com

app.get('/webhook/', function (req, res) {
  console.log('Reached');
  if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);

  } else {
    res.send('Error, wrong token')
    console.log('Reached but error');
  }
});


//done till here*
//***************************************************************************************************
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
//static folder containing UI
app.use(express.static(__dirname + "/dist"));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', './dist'); 
app.use(passport.initialize());
app.use(passport.session());

//*************************-----------------------------------------------------***********************************
//created by Raj Pratim Bhattacharya
//var Api = require('./ui/js/api');
var userPayload;
var watsonPayload;
var context;
var resp =''
var res1234
var message_aagya;

app.post('/webhook/', function (req, res) {

  //console.log("Reached");  
  //user = require('./index');
  console.log('----%%%%%%%%%%%%%&&&&&&&&&&&&&&&&@@@@@'+ current_user+ 'csac '+current_user.name);
  let messaging_events = req.body.entry[0].messaging
  for (let i = 0; i < messaging_events.length; i++) {
    let event = req.body.entry[0].messaging[i]
    let sender = event.sender.id;
    // console.log("sender " +sender );
    if (event.message && event.message.text) {
      let text = event.message.text
   // Api.postConversationMessage(text);
       var data = {'input': {'text': text}};
      if (context) {
        data.context = context;
      }
     // res1234 ='';
      //var result = BOT_testmessage(data, resp);
      console.log("Message  ----- " + event.message.text);
      if (text === 'Generic') {
        console.log("welcome to chatbot")
        sendGenericMessage(sender)
        continue
      } 
        var result = BOT_testmessage(data, sender, resp);
         sendTextMessage(sender, "Text received, echo: " + text);
        //sendTextMessage(sender, result.output.text);
       // console.log('Response from text ------------- '+ result );
}
    if (event.postback) {
      let text = JSON.stringify(event.postback);
      //passport.authenticate('google', { scope: ['profile', 'email'] });
      sendTextMessage(sender, "Postback received: " + text.substring(0, 200), token)
      continue
    }
  }
  res.sendStatus(200)
})


// recommended to inject access tokens as environmental variables, e.g.
// const token = process.env.FB_PAGE_ACCESS_TOKEN
var fbbotData = require('./config/fbbot_cred');
const token = fbbotData.facebook.pageAccessToken;

function sendTextMessage(sender, text) {
  let messageData = { text: text }

  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: token },
    method: 'POST',
    json: {
      recipient: { id: sender },
      message: messageData,
    }
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
  })
}

function sendGenericMessage(sender) {
  let messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Bennit AI",
          "subtitle": "Welcome to Work evolved",
          "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
          "buttons": [{
            "type": "web_url",
            "url": "http://bennitfbbot.mybluemix.net/auth/google",
            "title": "Actual website"
          }, {
            "type": "postback",
            "title": "signup & continue",
            "payload": "Payload for first element in a generic bubble",
          }],
        },
        ]
      }
    }
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: token },
    method: 'POST',
    json: {
      recipient: { id: sender },
      message: messageData,
    }
  }, function (error, response, body) {

    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error Gundruk: ', response.body.error)
    }
    //else{

    //   }
  })
}
  // Send a message request to the server
   
//**********************-------------------------------------------------***********************************************




// Create the service wrapper
var conversation = watson.conversation({
  username: process.env.CONVERSATION_USERNAME || '<username>',
  password: process.env.CONVERSATION_PASSWORD || '<password>',
  version_date: '2016-07-11',
  version: 'v1'
});

var expressWs = require('express-ws')(app);
/// Websocket

///
var alertChannelWs = expressWs.getWss('/alertChannel');

app.ws('/alertChannel', function (ws, req) {
  ws.on('connection', function (msg) {
    console.log('ws-----------' + msg);
    alertChannelWs.clients;

    //ws.send(msg);
  });
});




app.ws('/sensorDataUser', function (ws, req) {

  ws.on('connection', function (msg) {
    console.log("Connection Made: " + msg);
  });


  ws.on('message', function (msg) {
    console.log("SensorData: " + msg);
    var message = JSON.parse(msg);
    //req.session.
    if (message.type == "panic") {
      console.log("panic from: " + message.deviceId);
      var clientInTrouble = null;
      var nameClientInTrouble = null;
      var clientToAssist = null;
      var numberOfClients = alertChannelWs.clients.length;
      console.log("Length of client array: " + alertChannelWs.clients.length);


      alertChannelWs.clients.forEach(function (client) {
        if (client.upgradeReq.session.user) {
          var _id = client.upgradeReq.session.user.clientid;//clientIdAuthIdMap.val(client.upgradeReq.);
          console.log("ClientID: " + client.upgradeReq.session.user.clientid);
          cloudantLookup(_id, cloudantDb, function (err, userDetails) {
            if (err) {
              console.log("DB error on device id lookup");
              return;
            }
            numberOfClients--;
            if (message.deviceId == userDetails.deviceid) {
              console.log(JSON.stringify(message) + "db devID: " + userDetails.deviceid + " client id: " + client.upgradeReq.sessionID + " name: " + userDetails.name);
              clientInTrouble = client;
              nameClientInTrouble = userDetails.name;
              //client.send(JSON.stringify(message));
            }
            if (message.deviceId == userDetails.listendeviceid) {
              console.log("Found a buddy: " + userDetails.name);
              clientToAssist = client;
            }

            console.log("Number of clients: " + numberOfClients);
            if (numberOfClients == 0) {
              console.log("Sending alerts...");
              if (clientInTrouble != null) {
                console.log("Sending alerts to Client in trouble");
                clientInTrouble.send(JSON.stringify(message));
              }

              if (clientToAssist != null) {
                console.log("Sending alerts to assistant");
                message.alertmessage = "Alert: Please assist " + nameClientInTrouble;
                message.type = 'notify';
                clientToAssist.send(JSON.stringify(message));
              }
            }
          });
        } else {
          numberOfClients--;
        }
      });

    }
  });
});

app.get('/test', function (req, res) {
  req.body
  res.send({ bennitai: "Hello I'm BennitAI..." });
});

app.post('/testpost_old', function (req, res) {
  console.log("testpost.......")
  var jsonInput = JSON.parse(req.body.input);
  console.log(jsonInput.userid._id);
});

  function BOT_testmessage(body,sender, res) {

  console.log('testpost------------------------------------------')
  if (!workspace_id || workspace_id === '<workspace-id>') {
    //If the workspace id is not specified notify the user
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' +
        '<a href="https://github.com/bennit-ai/BennitWebAppV3">README</a> documentation on how to set this variable. <br>' +
        'Once a workspace has been defined the intents may be imported from ' +
        '<a href="https://github.com/bennit-ai/BennitWebAppV2/training/Bennit_workspace.json">here</a> in order to get a working application.'
      }
    });
  }

  var payload = {
    workspace_id: workspace_id,
    context: {}
  };

  if (body) {
    if ( body.input) {

   
      payload.input =  body.input;//req.body.input;

      
    }

    if (body.context) {
        payload.context = body.context;
      // The client must maintain context/state.  NOTE: It is important that payload.context.system and payload.context.__proto__ of
      // the payload remain the same as the req.body.context.system and req.body.context.__proto__ otherwise we jump to
      // invalid nodes in the Dialog
      //payload.context = req.body.context;
      /// The conversationstart signals the first interaction with Bennit for a session, thus we check if this is a
      /// returning user. If so we update the context by setting the payload context and sending it to the conversation
      /// service.
      /// If the conversation service sends a flowcontrol property deal with it.
      if (payload.context.flowcontrol) {
        if (payload.context.flowcontrol.learn == true) {
          payload.context.flowcontrol.learn = false;
          console.log("Asking a question: " + payload.input.text);
          //payload.context.system = req.body.context.system;
          //payload.context.__proto__ = req.body.context.__proto__;
          return askRetrieveAndRank(payload.input.text, payload, res, lookUpSolr);
        }
        else {
          console.log("%%%%%%%%%%%%%%1");
          return sendToConversationService(payload, sender,  res);
        }
      } else {
        console.log("%%%%%%%%%%%%%%2");
        if (jsonInput.userid) {
          payload.context.name = jsonInput.userid.name;
          payload.context._id = jsonInput.userid._id;
          console.log("Setting _id and name");
          console.log("Getting user details from db");
          return getContextForUser(bennitscoremap, payload, res, cloudantDb, sendToConversationService);
        }
        console.log("Input: ");
        console.log(payload.input);
        //payload.input = {Input:"hello test"};
        // Send the input to the conversation service
        return sendToConversationService(payload, sender ,res);
      }
    }
    else /// If there is no context in the request this is the first interaction of the session.
    /// query the database and populate the context*/
    {
      console.log("%%%%%%%%%%%%%%3");

       payload.context.name = current_user.name//req.session.user.name;
       payload.context.email = current_user.email;//req.session.user.email;
       payload.context._id = current_user.clientid;//req.session.user.clientid;
       console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@Auth id: "+ current_user.clientid);
      // payload.context.area = "";
      // payload.context.role = "";
      // payload.context.machine = "";
      // payload.context.deviceid ="";
      // payload.context.nodevice = false;
      return getContextForUser(bennitscoremap, payload, res, cloudantDb, sendToConversationService);
    }
  } else {
    console.log("%%%%%%%%%%%%%%4");
    console.log(body);

    // Send the input to the conversation service
    return sendToConversationService(payload,sender,  res);
  }
}

/*app.post('/testpost', function(req, res){
  console.log("This is almost working");
  console.log(req.body.Input);
  res.send({bennitai:"Hi I'm bennit"});
});*/

// Handle the IoT Sensor tag
app.post('/iot', function (req, res) {
  console.log("IoT endpoint");
  //console.log(req);

  //console.log(res);
  res.send("This one piece reply");
});
 

app.post('/api/message', function (req, res) {
  console.log('api/post-------------------------------------->');
  if (!workspace_id || workspace_id === '<workspace-id>') {
    //If the workspace id is not specified notify the user
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' +
        '<a href="https://github.com/bennit-ai/BennitWebAppV3">README</a> documentation on how to set this variable. <br>' +
        'Once a workspace has been defined the intents may be imported from ' +
        '<a href="https://github.com/bennit-ai/BennitWebAppV2/training/Bennit_workspace.json">here</a> in order to get a working application.'
      }
    });
  }
  var payload = {
    workspace_id: workspace_id,
    context: {}
  };

  if (req.body) {
    if (req.body.input) {
      payload.input = req.body.input;
      console.log('req.body---------->' + req.body.input);
      console.log(req.body.context);
    }

    if (req.body.context) {
      // The client must maintain context/state.  NOTE: It is important that payload.context.system and payload.context.__proto__ of
      // the payload remain the same as the req.body.context.system and req.body.context.__proto__ otherwise we jump to
      // invalid nodes in the Dialog
      payload.context = req.body.context;
      /// The conversationstart signals the first interaction with Bennit for a session, thus we check if this is a
      /// returning user. If so we update the context by setting the payload context and sending it to the conversation
      /// service.
      /// If the conversation service sends a flowcontrol property deal with it.
      if (payload.context.flowcontrol) {
        if (payload.context.flowcontrol.learn == true) {
          payload.context.flowcontrol.learn = false;
          console.log("Asking a question: " + payload.input.text);
          payload.context.system = req.body.context.system;
          payload.context.__proto__ = req.body.context.__proto__;
          return askRetrieveAndRank(payload.input.text, payload, res, lookUpSolr);
        }
        else {
          console.log("%%%%%%%%%%%%%%1");
          return sendToConversationService(payload, res);
        }
      } else {
        console.log("%%%%%%%%%%%%%%2");
        // Send the input to the conversation service
        return sendToConversationService(payload, res);
      }
    }
    else /// If there is no context in the request this is the first interaction of the session.
    /// query the database and populate the context
    {
      console.log("%%%%%%%%%%%%%%3");
      payload.context.name =  req.session.user.name;
      payload.context.familyname = "";
      payload.context.email = req.session.user.email;
      payload.context._id = req.session.user.clientid;
     
      /*console.log(req.session.user);
      console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@Auth id: " + req.session.user.clientid);
       payload.context.area = "";
       payload.context.role = "";
       payload.context.machine = "";
       payload.context.deviceid ="";
       payload.context.nodevice = false;
      */
      return getContextForUser(bennitscoremap, payload, res, cloudantDb, sendToConversationService);
    }
  } else {
    console.log("%%%%%%%%%%%%%%4");
    // Send the input to the conversation service
    return sendToConversationService(payload, res);
  }
});


   



function runConversationStart(payload, cloudantDb, req, res) {
  /// Set the conversationstart flowcontrol context variable to false;
  payload.context.flowcontrol.conversationstart = false;
  /// Since this is the start of a conversation we assume that the input text is a name.
  payload.context.name = payload.input.text;
  /// Chec to see if we have this person in the database, and send payload to the coversation service.
  return getContextForUser(bennitscoremap, payload, cloudantDb, function () {
    /// NOTE: This is NB! Restore the correct session context system details.
    payload.context.system = req.body.context.system;
    payload.context.__proto__ = req.body.context.__proto__;
    conversation.message(payload, function (err, data) {
      if (err) {
        return res.status(err.code || 500).json(err);
      }
      return res.json(data);
    });
  });
}
 




function sendLoginDetails(payload, req, res) {
  //payload.context.name = "hhahahahmmm";
  console.log("Name login: " + payload.context.name);
  conversation.message(payload, function (err, data) {
    if (err) {
      console.error(JSON.stringify(err));
      return res.status(err.code || 500).json(err);
    }
    //var nameEncoded = encodeURIComponent(payload.context.name);
    console.log('data: ' + data);
    //req.session.name = payload.context.name;
    res.redirect('/chat'/*?name='+nameEncoded*/);
  });
}

/// Sends the payload to the Conversation Service
function sendToConversationService(payload,  res) {
  //payload.context.name = "GetnameHere";
  console.log("Name given to watson");
  console.log(payload.context.name);
  conversation.message(payload, function (err, data) {
    if (err) {
      console.error(JSON.stringify(err));
      return res.status(err.code || 500).json(err);
    }

    if (data.context.flowcontrol) {
      if (data.context.flowcontrol.whichmachinesdown == true) {
        data.context.flowcontrol.whichmachinesdown = false;
        console.log("Query plant status update");
        /// This list should be from a DB query
        var listMachineIds = ["Press01", "Mixer01", "BeadMachine01"];
        async.series(
          [
            function (next) {
              cloudantLookup(listMachineIds[0], cloudantDb, next);
            },
            function (next) {
              cloudantLookup(listMachineIds[1], cloudantDb, next);
            },
            function (next) {
              cloudantLookup(listMachineIds[2], cloudantDb, next);
            }
          ],
          function (err, result) {
            if (!err) {
              console.log("Async results: ");
              console.log('resultsts1233@####################### '+JSON.stringify(result));
              /// The second element in the async series results is the Machine/Plant status.
              data.output.text = "";
              var aMachineIsDown = false;
              result.forEach(function (element, index, array) {
                if (element.status == "down" || element.status == "Down") {
                  aMachineIsDown = true;
                  data.output.text = data.output.text + element.machinename + " Status: " + element.status + endOfLine;
                  data.output.text = data.output.text + " Line: " + element.line + " Area: " + element.area + " Sensors: " + endOfLine + "Temperature: " + element.sensors.temperature + " Humidity: " + element.sensors.humidity + ".           " + endOfLine;
                  data.output.text = data.output.text + endOfLine + endOfLine;
                }
              });
              var comment = (aMachineIsDown) ? "The following machines are down: " : "Currently no machines are down. Ask about performance for current machine states";
              data.output.text = comment.concat(data.output.text);
              //data.output.text = result[1];
              //return res.json(updateMessage(payload, data));
              res1234 = updateMessage(payload, data, sender);
              console.log('payloadddddddddddddddddddd msggggggg  1 '+res1234.output.text);
                //responseHandler(JSON.parse(updateMessage(payload, data)));

              return res1234;
          }
          }
        );
       
      }
      else if (data.context.flowcontrol.performance == true) {
        data.context.flowcontrol.performance = false;
        console.log("Query plant status performance");
        var listMachineIds = ["Press01", "Mixer01", "BeadMachine01"];
        async.series(
          [
            function (next) {
              cloudantLookup(listMachineIds[0], cloudantDb, next);
            },
            function (next) {
              cloudantLookup(listMachineIds[1], cloudantDb, next);
            },
            function (next) {
              cloudantLookup(listMachineIds[2], cloudantDb, next);
            }
          ],
          function (err, result) {
            if (!err) {
                 console.log('resultsts1233@####################### '+JSON.stringify(result));
              data.output.text = "Performance report: ";
              result.forEach(function (element, index, array) {
                if (data.context.machine == element.machinename) {
                  data.output.text = data.output.text + element.machinename + " Status: " + element.status + endOfLine;
                  data.output.text = data.output.text + " Line: " + element.line + " Area: " + element.area + " Sensors: " + endOfLine + "Temperature: " + element.sensors.temperature + " Humidity: " + element.sensors.humidity + ".           " + endOfLine;
                  data.output.text = data.output.text + endOfLine + endOfLine;
                }
              });
                res1234 = updateMessage(payload, data, sender);
                console.log('payloadddddddddddddddddddd msggggggg 2  '+res1234.output.text);
                responseHandler(JSON.parse(updateMessage(payload, data)));

                return res1234;
              //return res.json(updateMessage(payload, data));
            }
          }
        );
      }
      else if (data.context.flowcontrol.performancereport == true) {
        data.context.flowcontrol.performancereport = false;
        console.log("Query plant status performance");
        var listMachineIds = ["Press01", "Mixer01", "BeadMachine01"];
        async.series(
          [
            function (next) {
              cloudantLookup(listMachineIds[0], cloudantDb, next);
            },
            function (next) {
              cloudantLookup(listMachineIds[1], cloudantDb, next);
            },
            function (next) {
              cloudantLookup(listMachineIds[2], cloudantDb, next);
            }
          ],
          function (err, result) {
            if (!err) {
                 console.log('resultsts1233@####################### '+JSON.stringify(result));
              data.output.text = "Performance report: ";
              result.forEach(function (element, index, array) {
                data.output.text = data.output.text + element.machinename + " Status: " + element.status + endOfLine;
                data.output.text = data.output.text + " Line: " + element.line + " Area: " + element.area + " Sensors: " + endOfLine + "Temperature: " + element.sensors.temperature + " Humidity: " + element.sensors.humidity + ".           " + endOfLine;
                data.output.text = data.output.text + endOfLine + endOfLine;

              });
              res1234 = updateMessage(payload, data,sender);
              console.log('payloadddddddddddddddddddd msggggggg 3  '+res1234.output.text);
              responseHandler(JSON.parse(updateMessage(payload, data)));

              return res1234;
              //return res.json(updateMessage(payload, data));
            }
          }
        );
      }
      else{
        res1234 = updateMessage(payload, data, sender);
        console.log('payloadddddddddddddddddddd msggggggg 4  '+res1234.output.text);
        //return res.json(updateMessage(payload, data));}
        responseHandler(JSON.parse(updateMessage(payload, data)));

        return res1234;
      }
    } else
    res1234 = updateMessage(payload, data, sender);
        console.log('payloadddddddddddddddddddd msggggggg 5  '+data.output.text);
       responseHandler(JSON.parse(updateMessage(payload, data)));

        return res1234;
      //return res.json(updateMessage(payload, data));
       
  });
}


function updateMessage(payload, response, sender) {

  console.log('##############^^^^^^^^^^^^^^^^^^  response from conversation '+response.input)
   // + ' '+ response.intents +' out  '+ response.output.text);
  for (let i = 0; i <response.output.log_messages.length; i++)
        console.log('log_Message '+response.output.log_messages[i] );
     
  for (let i = 0; i <response.output.text.length; i++)
        console.log('Text _Message '+response.output.text[i] );
     
 for (let i = 0; i <response.intents.length; i++)
  {
        console.log('Intent _Message '+response.intents[i].intent + ' confidence'+ response.intents[i].confidence );
        message_aagya = response.intents[i].intent
}
  
   
   // console.log(response);
    //sendTextMessage(sender, 'output ');
       

  /// update the scores:


  /// Check if we want to award points
  if (response.context.scorechangedetails)
    response.context.bennitscore = parseInt(bennitscoremap[response.context._id]) + parseInt(pointScheme.scorechangedetails);
  if (response.context.scoreevent)
    response.context.bennitscore = parseInt(bennitscoremap[response.context._id]) + parseInt(pointScheme.scoreevent);
  if (response.context.scorefeedback)
    response.context.bennitscore = parseInt(bennitscoremap[response.context._id]) + parseInt(pointScheme.scorefeedback);
  if (response.context.scoreleaving)
    response.context.bennitscore = parseInt(bennitscoremap[response.context._id]) + parseInt(pointScheme.scoreleaving);
  if (response.context.scorestart)
    response.context.bennitscore = parseInt(bennitscoremap[response.context._id]) + parseInt(pointScheme.scorestart);
  if (response.context.scoresafety)
    response.context.bennitscore = parseInt(bennitscoremap[response.context._id]) + parseInt(pointScheme.scoresafety);
  if (response.context.scoreidea)
    response.context.bennitscore = parseInt(bennitscoremap[response.context._id]) + parseInt(pointScheme.scoreidea);
  if (response.context.scorereport)
    response.context.bennitscore = parseInt(bennitscoremap[response.context._id]) + parseInt(pointScheme.scorereport);

  /// update the local store of points
  bennitscoremap[response.context._id] = response.context.bennitscore;

  /// Reset the award flags
  response.context.scorechangedetails = false;
  response.context.scoreevent = false;
  response.context.scorefeedback = false;
  response.context.scoreleaving = false;
  response.context.scorestart = false;
  response.context.scoresafety = false;
  response.context.scorereport = false;
  response.context.scoreidea = false;

  /// If the flow control property has been defined deal with it

  if (response.context.flowcontrol) {
    if (/*response.context.flowcontrol.learn == true*/  response.context.flowcontrol.whichmachinesdown == true || response.context.flowcontrol.performance == true) {
      console.log("Flow control so not saving context");
    }
    else {
      console.log("Flow to here");
      console.log("Build up context id: " + response.context._id)
      /// This assignment is in a adhoc place.TODO: tidy this up
      response.context.name = payload.context.name;
      response.context.email = payload.context.email;

      buildUpUserDetails(response.context, cloudantDb);
      // buildUpContext(payload.context.id,response, cloudantDb);
      buildUpUserInteraction(response.context, cloudantDb);

    }

  }
  else {
    console.log("Flow to here 3");
    //buildUpContext(payload._id, response, cloudantDb);

    buildUpUserDetails(response.context, cloudantDb);
    buildUpUserInteraction(response.context, cloudantDb);

  }
  
  return response;
}
 
//-------------------------------------------------------------------------------------------------------
function createPlantStatusIndex(cloudantDb) {
  // Note, you can make a normal JavaScript function. It is not necessary
  // for you to convert it to a string as with other languages and tools.
  var plantStatus_indexer = function (doc) {
    if (doc.machineid && doc.machinetype && doc.machinename && doc.line && doc.area && doc.status && doc.timestamp) {
      // This looks like a machine status doc.
      index('machineid', doc.machineid);
      index('machinetype', doc.machinetype);
      index('machinename', doc.machinename);
      index('line', doc.line);
      index('area', doc.area);
      index('status', doc.status);
      index('timestamp', doc.timestamp);

    }
  }

  var ddoc = {
    _id: '_design/machinestatusv2',
    indexes: {
      machines: {
        analyzer: { name: 'standard' },
        index: plantStatus_indexer
      }
    }
  };

  cloudantDb.insert(ddoc, function (er, result) {
    if (er) {
      console.log("Indexer already exists");/// TODO: This is not exactly true...
    }

    console.log('Created design document with plant status index');
  });
  /*  var machineName = {machineName:'machinename', type:'json', index:{fields:['machineName']}}
    cloudantDb.index(machineName, function(er, response) {
      if (er) {
        throw er;
      }
      console.log('Index creation result: %s', response.result);
    });*/
}

function lookupCloudant(docId, payload, res, callback) {
  cloudantDb.get(docId, function (err, body) {
    if (err) {
      console.log("Could not find user in db");
      //return callback(payload,res);
    }
    else {
      console.log("type: %s Role: %s Area %s, Machine %s", body.type, body.machinename, body.status, body.timestamp);
      //console.log(body);
      var date = new Date(body.timestamp);
      payload.context.plantstatus = "Current plant status: " + body.machinename + " : status  " + body.status + ". Last update was at " + date.toDateString() + " " + date.toLocaleTimeString();
      res.context.plantstatus = "Current plant status: " + body.machinename + " : status  " + body.status + ". Last update was at " + date.toDateString() + " " + date.toLocaleTimeString();
      res.output.text = "Current plant status: " + body.machinename + " : status  " + body.status + ". Last update was at " + date.toDateString() + " " + date.toLocaleTimeString();
      return callback(res);
    }
  })
}

function lookupCloudantSeries2(docId, callback) {
  cloudantDb.get(gDocId, function (err, body) {
    if (err) {
      console.log("Could not find user in db");
      callback(err);
    }
    else {
      console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%type: doc id %s,  %s Machine name: %s status: %s, timestamp: %s", docId, body.type, body.machinename, body.status, body.timestamp);
      console.log(body);
      var date = new Date(body.timestamp);
      var plantStatus = body.machinename + ": status  " + body.status + ". Sensors: temperature[C] = " + body.sensors.temperature + ", humidity[%] = " + body.sensors.humidity + ". Last update: " + date.toDateString() + " " + date.toLocaleTimeString();
      callback(null, plantStatus);
    }
  });
}

function queryPlantStatusThenUpdate(payload, response) {
  response.output.text = "This is a start";

  return response;
  //return  queryPlantStatus(payload,response,lookupCloudant);
  //return callback(queryPlantStatus(payload,res, lookupCloudant));
}

function queryMachineStatusSeries1(payload, response, docId, callback) {
  cloudantDb.search('machinestatusv2', 'machines', { q: 'machinename:Press' }, function (err, result) {
    if (err) {
      console.log(err);
      callback(err);
    }
    else {
      console.log("query dasssssssssssssssssssssssssssssssss " + JSON.stringify(payload.context));
      console.log('Showing %d out of a total %d machines', result.rows.length, result.total_rows);
      for (var i = 0; i < result.rows.length; i++) {
        console.log('Document id: %s', result.rows[i].id);
      }
      if (result.rows.length > 0) {
        payload.context.plantstatus = "Press status: " + JSON.stringify(result.rows[0]);
      }
      gDocId = result.rows[0].id;
      console.log("docId: %s", gDocId);
      callback(null, result.rows[0].id);
    }
  });
}

function queryPlantStatus(payload, res, callback) {
  cloudantDb.search('machinestatus', 'machines', { q: 'machinename:Press' }, function (err, result) {
    if (err) {
      console.log(err);
      return res;
      //return sendToConversationService(payload,res);
    }
    else {
      console.log('Showing %d out of a total %d machines', result.rows.length, result.total_rows);
      for (var i = 0; i < result.rows.length; i++) {
        console.log('Document id: %s', result.rows[i].id);
      }
      if (result.rows.length > 0) {
        payload.context.plantstatus = "Press status: " + JSON.stringify(result.rows[0]);
      }

      return lookupCloudant(result.rows[0].id, payload, res, Callback);
    }
  });
}


function lookUpSolr(id, payload, res, callback) {
  var solrClient = retrieve_and_rank.createSolrClient(retrieve_and_rank_params);
  var ranker_id = process.env.RANKER_ID;//'c852c8x19-rank-910';
  solrClient.realTimeGet(id, function (err, obj) {
    console.log(JSON.stringify(obj, null, 2));
    payload.context.corpusanswer = obj.response.docs[0].body;//searchResponse.response.docs[0].title;
    return sendToConversationService(payload, res);
  });

}

function askRetrieveAndRank(question, payload, res, lookUp) {
  //  Use a querystring parser to encode output.
  var qs = require('qs');
  console.log("Asking a question called R&R");
  // Get a Solr client for indexing and searching documents.
  // See https://github.com/watson-developer-cloud/node-sdk/blob/master/services/retrieve_and_rank/v1.js
  var solrClient = retrieve_and_rank.createSolrClient(retrieve_and_rank_params);
  var ranker_id = process.env.RANKER_ID;//'c852c8x19-rank-910';
  //var question = 'what is the basic mechanism of the transonic aileron buzz';
  var query = qs.stringify({ q: question, ranker_id: ranker_id, fl: 'id,title' });

  solrClient.get('fcselect', query, function (err, searchResponse) {
    if (err) {
      console.log('Error searching for documents: ' + err);
      payload.context.corpusanswer = "Could not find answer";
      return sendToConversationService(payload, res);
    }
    else {
      if (searchResponse.response.docs.length > 0)
        return lookUp(searchResponse.response.docs[0].id, payload, res, sendToConversationService);
      else
        payload.context.corpusanswer = "I don't have knowledge in this area";
      return sendToConversationService(payload, res);

    } 

  });
}

if (cloudantUrl) {
  //If logging has been enabled (as signalled by the presence of the cloudantUrl) then the
  //app developer must also specify a LOG_USER and LOG_PASS env vars.
  if (!process.env.LOG_USER || !process.env.LOG_PASS) {
    throw new Error("LOG_USER OR LOG_PASS not defined, both required to enable logging!");
  }
  //add basic auth to the endpoints to retrieve the logs!
  var auth = basicAuth(process.env.LOG_USER, process.env.LOG_PASS);
  //If the cloudantUrl has been configured then we will want to set up a cloudant client
  var Cloudant = require('cloudant');
  var cloudant = Cloudant({ account: process.env.LOG_USER, password: process.env.LOG_PASS });
  // add a new API which allows us to retrieve the logs (note this is not secure)
  var dbName = process.env.DATABASE_NAME;
  //add a new API which allows us to retrieve the logs (note this is not secure)
  cloudant.db.get(dbName, function (err, body) {
    if (err) {
      cloudant.db.create(dbName, function (err, body) {
        cloudantDb = cloudant.db.use(dbName);
        createPlantStatusIndex(cloudantDb);
      });
    } else {
      cloudantDb = cloudant.db.use(dbName);
      createPlantStatusIndex(cloudantDb);
    }
  });
}


//app.use('/api/speech-to-text/', require('./speech/stt-token.js'));
//app.use('/api/text-to-speech/', require('./speech/tts-token.js'));

module.exports = app;
