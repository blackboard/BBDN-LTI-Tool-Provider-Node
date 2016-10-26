var MongoClient = require('mongodb').MongoClient;

var return_url = "https://community.blackboard.com/community/developers";

//Connection URL
var url = 'mongodb://localhost:27017/caliper';


exports.got_caliper = function(req, res){

	  console.log(req.headers);
	  console.log(JSON.stringify(req.body, null, '\t'));

	//Use connect method to connect to the Server
	MongoClient.connect(url, function(err, db) {
		console.log("Connected correctly to server");

		// Insert a single document
		db.collection('caliper').insertOne(req.body, function(err, r) {
			if (err) console.log(err.message);
			
			console.log('Caliper event saved successfully!');
		});
		
		db.close();
		res.send(200);
	});
};

exports.show_events = function (req,res) {

	//Use connect method to connect to the Server
	MongoClient.connect(url, function(err, db) {
		console.log("Connected correctly to server");

		var events = [];
		
		// Insert a single document
		db.collection('caliper').find().sort({"_id":-1}).limit(25).toArray(function(err, docs) {
			if (err) console.log(err.message);
			
			console.log(JSON.stringify(docs, null, '\t'));
			
			docs.forEach(function(value) {
				if (value.sensor) {
					
					var date = new Date(value['sendTime']);
					
					events.push("<b>Sensor</b>: " + value['sensor'] +
									"<b> Send Time</b>: " + date +
									"<b> Type</b>: " + value['data']['@type'] +
									"<b> Actor</b>: " + value['data']['actor']['@id'] +
									"<b> Session</b>: " + value['data']['federatedSession'] + "<br />");
				}  
				console.log(value);
			});
			
			res.render('lti', { title: 'View Caliper Event Store!', content: events, return_url: return_url });
		});
		
		
		db.close();
	});
};