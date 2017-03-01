/**
 * Created by Benjamin on 10/21/2016.
 */


// return {payload:{test:"test"}};
var date = new Date();
var firstPressTime;// = date.getTime() / 1000;
var currentPressTime;
var isTiming =  context.get('isTiming') || false;
currentPressTime = date.getTime() / 1000;

if (msg.payload.d.key1 == 1)
{
    // currentPressTime = date.getTime()/1000;
  if (!isTiming)
    {
    firstPressTime = date.getTime() / 1000;
    context.set('firstPressTime', firstPressTime);
    context.set('isTiming', true);
    var panic = {payload: {type: 'panic', key1panic: 1, deviceId: msg.deviceId}};
    return panic;
  }
}

if ( (currentPressTime - context.get('firstPressTime')) > 10)
{
  context.set('isTiming', false);
}

var blank = { payload: {  type: 'none',
    isTiming: context.get('isTiming'),
    key1: msg.payload.d.key1,
    diff: currentPressTime - context.get('firstPressTime'),
    deviceId: msg.deviceId
}};
return blank;
