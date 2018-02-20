var MongoClient = require('mongodb').MongoClient;

const MAX_RECORDS = 5;

var return_url = "https://community.blackboard.com/community/developers";

//Connection URL
var url = 'mongodb://localhost:27017/caliper';

//replaces all "." in keys with ":"
var processData = function (data) {
  if (!data) {
    return data;
  } else if (Array.isArray(data)) {
    return data.map(processData);
  } else if (typeof data === 'object') {
    return Object.keys(data).reduce(function (obj, key) {
      var newKey = key.replace(/\./g, ":");
      obj[newKey] = processData(data[key]);
      return obj;
    }, {});
  } else {
    return data;
  }
};


exports.got_caliper = function (req, res) {

  console.log(req.headers);
  console.log(JSON.stringify(req.body, null, '\t'));

  //Use connect method to connect to the Server
  MongoClient.connect(url, function (err, db) {
    console.log("Connected correctly to server");

    var event = processData(req.body);

    console.log(JSON.stringify(event, null, '\t'));

    // Insert a single document
    db.collection('caliper').insert(event, function (err, r) {
      if (err) console.log("Error encountered during caliper event save: " + err.message);

      console.log('Caliper event saved successfully!');

      db.collection('caliper').count(function (err, count) {
        if (err) console.log("Error counting records: " + err.message);

        console.log("The caliper database contains " + count + " records.");

        if (count > MAX_RECORDS) {

          var num_prune_recs = count - MAX_RECORDS;

          console.log("Record count exceeds the maximum number of records to store. Pruning the oldest " + num_prune_recs + " records.");

          db.collection('caliper').find().sort({"_id": 1}).limit(num_prune_recs).each(function (err, doc) {
            if (err) {
              console.log("Error reading caliper events from database: " + err.message);
              db.close();
              return false;
            }

            if (!doc) {
              db.close();
              return false;
            }

            db.collection('caliper').remove({"_id": doc._id});

          });

          if (num_prune_recs <= 0) db.close();
        }
      });
    });
  });
};


exports.show_events = function (req, res) {

  //Use connect method to connect to the Server
  MongoClient.connect(url, function (err, db) {
    console.log("Connected correctly to server");

    var events = "<table style=\"border: 1px solid\;\"><thead><tr style=\"border: 1px solid\;color: white\;background-color:blue\;\"><th style=\"border: 1px solid\;\"><b>SENSOR</b</th><th style=\"border: 1px solid\;\"><b>SENDTIME</b></th><th style=\"border: 1px solid\;\"><b>TYPE</b></th><th style=\"border: 1px solid\;\"><b>ACTOR</b></th><th style=\"border: 1px solid\;\"><b>SESSION</b></th></tr></thead><tbody>";

    if (db !== null) {
      // Insert a single document
      db.collection('caliper').find().sort({"_id": -1}).limit(25).each(function (err, doc) {
        if (err) {
          console.log("Error reading caliper events from database: " + err.message);
          res.render('lti', {
            title: 'View Caliper Event Store!',
            content: "Error reading caliper events from database: " + err.message,
            return_url: return_url,
            return_onclick: 'location.href=' + '\'' + return_url + '\''
          });
          db.close();
          return false;
        }

        if (!doc) {
          db.close();
          events += "</tbody></table>";
          res.render('lti', {
            title: 'View Caliper Event Store!',
            content: events,
            return_url: return_url,
            return_onclick: 'location.href=' + '\'' + return_url + '\''
          });
          return false;
        }

        console.log(JSON.stringify(doc, null, '\t'));

        var date = new Date(doc['sendTime']);

        events += "<tr style=\"border: 1px solid\;\"><td style=\"border: 1px solid\;\">" + doc['sensor'] +
          "</td><td style=\"border: 1px solid\;\">" + date +
          "</td><td style=\"border: 1px solid\;\">" + doc['data'][0]['@type'] +
          "</td><td style=\"border: 1px solid\;\">" + doc['data'][0]['actor']['@id'] +
          "</td><td style=\"border: 1px solid\;\">" + doc['data'][0]['federatedSession'] + "</tr>";

        console.log(events);
      });
    } else {
      res.render('lti', {
        title: 'View Caliper Event Store|',
        content: '<h2>DB not available</h2>',
        return_url: return_url,
        return_onclick: 'location.href=' + '\'' + return_url + '\''
      });
    }
  });
};
