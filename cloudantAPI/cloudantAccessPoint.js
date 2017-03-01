 

module.exports = {


  buildUpUserDetails: function (userDetailsToAdd, cloudantDb) {
    var userDetails = new (require('../models/userDetails'))();
    userDetails._id = userDetailsToAdd._id || 'lostuserdetails';
        // / Currently using the name as _id. This should be from Autho (google, facebook...)
        // userDetails._id = response.context.name
        // / remove the flow control property as we don't want to store that in ths db.
        // delete context.flowcontrol;
    cloudantDb.get(userDetails._id, {revs_info: true}, function (err, body) {
      if (!err) {
        userDetails._rev = body._rev;
        userDetails.email = userDetailsToAdd.email || body.email || '';
        userDetails.deviceid = userDetailsToAdd.deviceid || body.deviceid || '';
        userDetails.listendeviceid = userDetailsToAdd.listendeviceid || body.listendeviceid || '';
        userDetails.nodevice = userDetailsToAdd.nodevice || body.nodevice || '';
        userDetails.listendeviceid = userDetailsToAdd.listendeviceid || body.listendeviceid || '';
        userDetails.name = userDetailsToAdd.name || body.name || '';
        userDetails.displayname = userDetailsToAdd.displayname || body.displayname || '';

        userDetails.machine = userDetailsToAdd.machine || body.machine || '';

        userDetails.areaflow = userDetailsToAdd.areaflow || body.areaflow || '';
        userDetails.hybridareaflow = userDetailsToAdd.hybridareaflow || body.hybridareaflow || '';
        userDetails.routing = userDetailsToAdd.routing || body.routing || '';
        userDetails.scheduling = userDetailsToAdd.scheduling || body.scheduling || '';
        userDetails.schedulingcombined = userDetailsToAdd.schedulingcombined || body.schedulingcombined || '';
        userDetails.mix = userDetailsToAdd.mix || body.mix || '';
        userDetails.shiftnumrun = userDetailsToAdd.shiftnumrun || body.shiftnumrun || '';
        userDetails.shifttimenight = userDetailsToAdd.shifttimenight || body.shifttimenight || '';
        userDetails.shifttimemorning = userDetailsToAdd.shifttimemorning || body.shifttimemorning || '';
        userDetails.shifttimeafternoon = userDetailsToAdd.shifttimeafternoon || body.shifttimeafternoon || '';
        userDetails.numoperations = userDetailsToAdd.numoperations || body.numoperations || '';
        userDetails.numgroup = userDetailsToAdd.numgroup || body.numgroup || '';
        userDetails.numadmin = userDetailsToAdd.numadmin || body.numadmin || '';

                // / EAP Registration
        userDetails.workplace = userDetailsToAdd.workplace || body.workplace || '';
        userDetails.role = userDetailsToAdd.role || body.role || '';
        userDetails.area = userDetailsToAdd.area || body.area || '';
        userDetails.expertise = userDetailsToAdd.expertise || body.expertise  || '';
        userDetails.activitylist = userDetailsToAdd.activitylist || body.activitylist || '';
        userDetails.favactivity = userDetailsToAdd.favactivity || body.favactivity || '';
        userDetails.favcolor = userDetailsToAdd.favcolor || body.favcolor || '';
        userDetails.trackgoal = userDetailsToAdd.trackgoal || body.trackgoal || false;
        userDetails.goaldetail = userDetailsToAdd.goaldetail || body.goaldetail || '';

                // / EAP Score
        userDetails.bennitscore = userDetailsToAdd.bennitscore || body.bennitscoremap || 0;


        cloudantDb.insert(userDetails, function (err, body) {
          if (!err) {
            console.log('Updating userDetails doc in the db');
                        // return callback(userPayload);
          }
          else
                        console.log('userDetails failed with rev   ' + err);
        });
      }
      else {
        cloudantDb.insert(userDetails, function (err, body) {
          if (!err) {
            console.log('Addig new userDetails doc to the db');
                        // return callback(userPayload);
          }
          else {
            console.log('Failed to add a new userDetails doc ERROR: ');
            console.log(err);
          }
        });
      }
    });
  },

  getContextForUser: function getContextForUser(scoremap, userPayload, res, cloudantDb, callback) {
    console.log('getting Context for id: ' + userPayload.context._id);
    cloudantDb.get(userPayload.context._id, function (err, body) {
      if (err) {
        console.log('Could not find user in db: ' + userPayload.context._id);
        return callback(userPayload, res);
      }
      else {
        console.log('Name: %s Role: %s Area %s, Machine %s', body.name, body.role, body.area, body.machine);

        if (body.name != null) {
          /// Get all details from db
          userPayload.context = body;

          var score = parseInt(body.bennitscore);
          if (isNaN(score))
            scoremap[userPayload.context._id] = score;
          else
                        scoremap[userPayload.context._id] = 999;
        }else {

          /// Google Auth gives some user details that should not be overidden by the default values in the db
          var name  = userPayload.context.name;
          var email = userPayload.context.email;
          var familyname = userPayload.context.familyname;
          /// Get all details from db
          userPayload.context = body;
          /// replace the correct names. TODO: do this is a better way.
          userPayload.context.name = name;
          userPayload.context.familyname = familyname;
          userPayload.context.email = email;
        }

               /* userPayload.context.area = body.area ||"";
                userPayload.context.machine = body.machine ||"";
                userPayload.context.role = body.role ||"";
                userPayload.context.deviceid = body.deviceid ||"";
                userPayload.context.nodevice = body.nodevice ||"";
                userPayload.context.listendeviceid = body.listendeviceid || "";*/



        return callback(userPayload, res);
      }
    });
  },

  buildUpDayUserInteractions: function (userInteractionsToAdd, cloudantDb) {
    var userInteractions = new (require('../models/userInteractions'))();

    var date = new Date();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var year = date.getFullYear();

    userInteractions._id = userInteractionsToAdd._id + '_' + day + '_' + month + '_' + year;
    console.log('User Id interactions: ' + userInteractions._id);

        // / remove the flow control property as we don't want to store that in ths db.
        // delete context.flowcontrol;
    cloudantDb.get(userInteractions._id, {revs_info: true}, function (err, body) {
      if (!err) {
        userInteractions._rev = body._rev;
        userInteractions.safetytrigger = userInteractionsToAdd.safetytrigger || body.safetytrigger || '';
        userInteractions.safetyissue = userInteractionsToAdd.safetyissue || body.safetyissue || '';
        userInteractions.needhelp = userInteractionsToAdd.needhelp || body.needhelp || '';
        userInteractions.emergencycall = userInteractionsToAdd.emergencycall || body.emergencycall || '';
        userInteractions.incidentdesc = userInteractionsToAdd.incidentdesc || body.incidentdesc || '';
        userInteractions.incidentdescmore = userInteractionsToAdd.incidentdescmore || body.incidentdescmore || '';

        userInteractions.howwasday = userInteractionsToAdd.howwasday || body.howwasday || '';
        userInteractions.meettargets = userInteractionsToAdd.meettargets || body.meettargets || '';
        userInteractions.interruptions = userInteractionsToAdd.interruptions || body.interruptions || '';
        userInteractions.safetyincident = userInteractionsToAdd.safetyincident || body.safetyincident || '';
        userInteractions.safetyincidentfeedback = userInteractionsToAdd.safetyincidentfeedback || body.safetyincidentfeedback || '';
        userInteractions.comfortable = userInteractionsToAdd.comfortable || body.comfortable || '';
                // userInteractions.majorplans =  userInteractionsToAdd.majorplans|| body.majorplans|| "";
                // userInteractions.impactonproduction  = userInteractionsToAdd.impactonproduction || body.impactonproduction || "";
                // userInteractions.feeltoday = userInteractionsToAdd.feeltoday || body.feeltoday || "";

                // / EAP Work life diary
        userInteractions.majorplans = userInteractionsToAdd.majorplans || body.majorplans || '';
        userInteractions.majorplansdetails = userInteractionsToAdd.majorplansdetails || body.majorplansdetails || '';
        userInteractions.impactonproduction = userInteractionsToAdd.impactonproduction || body.impactonproduction || '';
        userInteractions.impactonproductiondetails = userInteractionsToAdd.impactonproductiondetails || body.impactonproductiondetails || '';
        userInteractions.feeltoday = userInteractionsToAdd.feeltoday || body.feeltoday || '';

                // / EAP End-of-day
        userInteractions.ratinghappy = userInteractionsToAdd.ratinghappy || body.ratinghappy || '';
        userInteractions.ratingproduction = userInteractionsToAdd.ratingproduction || body.ratingproduction || '';
        userInteractions.ratingcollaboration = userInteractionsToAdd.ratingcollaboration || body.ratingcollaboration || '';
        userInteractions.ratingproductivity = userInteractionsToAdd.ratingproductivity || body.ratingproductivity || '';
        userInteractions.ratingsafety = userInteractionsToAdd.ratingsafety || body.ratingsafety || '';
        userInteractions.ratingrisk  = userInteractionsToAdd.ratingrisk || body.ratingrisk || '';
        userInteractions.issues  = userInteractionsToAdd.issues || body.issues || '';
        userInteractions.issuesdetails = userInteractionsToAdd.issuesdetails  || body.issuesdetails || '';
        userInteractions.positives  = userInteractionsToAdd.positives || body.positives || '';
        userInteractions.positivesdetails = userInteractionsToAdd.positivesdetails  || body.positivesdetails  || '';
        userInteractions.goalprogress = userInteractionsToAdd.goalprogress || body.goalprogress || '';

                // / EAP Survey-Stop
        userInteractions.surveystopped = userInteractionsToAdd.surveystopped || body.surveystopped || '';

                // / EAP Events
        userInteractions.specialevent = userInteractionsToAdd.specialevent || body.specialevent || '';
        userInteractions.specialeventdetails = userInteractionsToAdd.specialeventdetails || body.specialeventdetails || '';

                // / EAP Contribute
        userInteractions.ideaproductivity = userInteractionsToAdd.ideaproductivity || body.ideaproductivity || '';
        userInteractions.ideasafety = userInteractionsToAdd.ideasafety || body.ideasafety || '';
        userInteractions.ideaquality = userInteractionsToAdd.ideaquality  || body.ideaquality || '';
        userInteractions.ideaadvice = userInteractionsToAdd.ideaadvice || body.ideaadvice || '';
        userInteractions.ideaknowledge = userInteractionsToAdd.ideaknowledge || body.ideaknowledge || '';
        userInteractions.idearisk = userInteractionsToAdd.idearisk || body.idearisk || '';
        userInteractions.ideaother  = userInteractionsToAdd.ideaother  || body.ideaother || '';

                // / EAP Feedback
        userInteractions.feedbackrating = userInteractionsToAdd.feedbackrating || body.feedbackrating || '';
        userInteractions.feedbacklikemost = userInteractionsToAdd.feedbacklikemost || body.feedbacklikemost || '';
        userInteractions.feedbacklikeleast  = userInteractionsToAdd.feedbacklikeleast || body.feedbacklikeleast || '';
        userInteractions.feedback = userInteractionsToAdd.feedback || body.feedback || '';

        cloudantDb.insert(userInteractions, function (err, body) {
          if (!err) {
            console.log('Updating User Interactions doc in the db');
                        // return callback(userPayload);
          }
          else
                        console.log( 'User Interactions failed with rev   ' + err);
        });
      }
      else {
        cloudantDb.insert(userInteractions, function (err, body) {
          if (!err) {
            console.log('Addig new User Interactions doc to the db');
                        // return callback(userPayload);
          }
          else {
            console.log('User Interactions failed to add a new doc ERROR: ');
            console.log(err);
          }
        });
      }
    });
  }
};
