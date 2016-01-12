var lti = require('ims-lti');
var _ = require('lodash');

//for testing
var consumer_key = "12345";
var consumer_secret = "secret";
var sourcedid = "bbgc46gi65";
var lisoutcomesendpoint="https://cdev-saas-original-prod.blackboard.com/webapps/gradebook/lti11grade";




/*
 * POST LTI Launch Received
 */

exports.got_launch = function(req, res){

  var provider = new lti.Provider(consumer_key, consumer_secret);
  req.body = _.omit(req.body, '__proto__');

  console.log(req.headers);
  console.log(req.body);
  
  var content = "";
  
  var keys = Object.keys( req.body );
  for( var i = 0,length = keys.length; i < length; i++ ) {
     content += keys[i] + " = " + req.body[ keys[ i ] ] + "<br />";
  }
  
  provider.valid_request(req, function(err, isValid) {
     if(err) {
         console.log(err);
	 res.send(403);
     }
     else {
 	 if (!isValid) res.send(422);

	 res.render('lti', { title: 'LTI Launch Received!', content: content });
     }
  });
};

exports.caliper = function(req, res) {

};

exports.outcomes = function(req,res) {

  var options = {};

  options.consumer_key=consumer_key;
  options.consumer_secret=consumer_secret;
  options.service_url=lisoutcomesendpoint;
  options.source_did=sourcedid;

  var outcomes_service = new lti.OutcomeService(options);

  outcomes_service.send_replace_result(.5, function(err,result) {
    console.log(result); //True or false
  });
};
