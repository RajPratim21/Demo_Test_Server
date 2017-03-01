

    var userDetails = function  () {
        // / Google login details
      this._id = null;
      this.email = null;
      this.name = null;
      this.familyname = null;
        // / TODO: store profile picture, gender.

        // / Device
      this.deviceid = '';
      this.nodevice = '';
      this.listendeviceid = '';

        // / EAP Registration
      this.workplace = '';
      this.role = '';
      this.area = '';
      this.expertise = '';
      this.activitylist = '';
      this.favactivity = '';
      this.favcolor = '';
      this.trackgoal = false;
      this.goaldetail = '';

        // / EAP Score
      this.bennitscore = 10;
      this.scoreregistration = false;
      this.scorechangedetails = false;
      this.scorestart = false;
      this.scoreleaving = false;
      this.scoreidea = false;
      this.scorefeedback = false;
      this.scoresafety = false;
      this.scoreevent = false;
      this.scorereport = false;

        // / Bennit
      this.machine = '';
      this.areaflow = '';
      this.hybridareaflow = '';
      this.routing = '';
      this.scheduling = '';
      this.schedulingcombined = '';
      this.mix = '';
      this.shiftnumrun = '';
      this.shifttimenight = '';
      this.shifttimemorning = '';
      this.shifttimeafternoon = '';
      this.numoperations = '';
      this.numgroup = '';
      this.numadmin = '';
    };

    module.exports = userDetails;
