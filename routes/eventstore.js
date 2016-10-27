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
		db.collection('caliper').insertOne(req.body, {checkKeys:false}, function(err, r) {
			if (err) console.log(err.message);
			
			console.log('Caliper event saved successfully!');
		});
		
		db.close();
	});
};

exports.show_events = function (req,res) {

	//Use connect method to connect to the Server
	MongoClient.connect(url, function(err, db) {
		console.log("Connected correctly to server");

		var events = "<table style=\"border: 1px solid\;\"><thead><tr style=\"border: 1px solid\;color: white\;background-color:blue\;\"><th style=\"border: 1px solid\;\"><b>SENSOR</b</th><th style=\"border: 1px solid\;\"><b>SENDTIME</b></th><th style=\"border: 1px solid\;\"><b>TYPE</b></th><th style=\"border: 1px solid\;\"><b>ACTOR</b></th><th style=\"border: 1px solid\;\"><b>SESSION</b></th></tr></thead><tbody>";
		
		// Insert a single document
		db.collection('caliper').find().sort({"_id":-1}).limit(25).each(function(err, doc) {
			if (err) {
				console.log("Error reading caliper events from database: " + err.message);
				res.render('lti', { title: 'View Caliper Event Store!', content: "Error reading caliper events from database: " + err.message, return_url: return_url });
				db.close();
			}
			
			if (!doc )
			{
        			db.close();
				events += "</tbody></table>";
				res.render('lti', { title: 'View Caliper Event Store!', content: events, return_url: return_url });
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

	});

};
