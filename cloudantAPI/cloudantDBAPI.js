 

// / These cloudant utility function are to be used with async.series()
function cloudantIdLookup(docId, cloudantDb, callback) {
  if (cloudantDb) {
        // console.log("DB has been defined");
    cloudantDb.get(docId, function (err, body) {
      if (err) {
        console.log('Could not find user in db');
        return callback(err);
      }
      else {
                // console.log("returning body");
        return callback(null, body);
      }
    });
  }
}

module.exports = cloudantIdLookup;
