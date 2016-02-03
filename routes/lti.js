var lti = require('ims-lti');
var _ = require('lodash');
var oauth = require('oauth-signature');
var https = require('https');

//for testing
var consumer_key = "12345";
var consumer_secret = "secret";
var lis_result_sourcedid = "bbgc46gi65";
var lis_outcome_service_url="https://cdev-saas-original-prod.blackboard.com/webapps/gradebook/lti11grade";
var caliper_profile_url = "https://cdev-saas-original-prod.blackboard.com/learn/api/v1/telemetry/caliper/profile/_224_1";
var custom_caliper_federated_session_id = "https://caliper-mapping.cloudbb.blackboard.com/v1/sites/9f5a97f7-d97d-4f18-843f-ef5b0070f818/sessions/A2825184A0C661A77AF3AE17148C7DC5";




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
 	 
 	 lis_result_sourcedid = req.body['lis_result_sourcedid'];
 	 lis_outcome_service_url = req.body['lis_outcome_service_url'];
 	 caliper_profile_url = req.body['caliper_profile_url'];
 	 custom_caliper_federated_session_id = req.body['custom_caliper_federated_session_id'];
 	 
 	 res.render('lti', { title: 'LTI Launch Received!', content: content });
     }
  });
};

exports.caliper = function(req, res) {

	var options = {};

	options.consumer_key=consumer_key;
	options.consumer_secret=consumer_secret;
	options.caliper_profile_url=caliper_profile_url;
	  
	var caliper_service = new lti.CaliperService(options);

	caliper_service.register_caliper_listener( function(body) {
	    console.log("In lti.js: " + body); //True or false
	    
	    if(body.length <= 0){
	    	 res.render('lti', { title: 'Caliper Registration Failed!', content: err });
	    }
	    else{
	    	body = body.substring(9);

	    	var jsonBody = JSON.parse(body);
	    	var content = "Caliper Event Store URL: " + jsonBody.eventStoreUrl + "<br />";
	    	content += "Caliper API Key: " + jsonBody.apiKey + "<br />";
	        res.render('lti', { title: 'Caliper Registration successfully sent!', content: content });
	    }
	});
	    
	/*var now = + new Date();
	var parameters = {
			oauth_consumer_key : 'dpf43f3p2l4k3l03',
			oauth_nonce : 'kllo9940pd9333jh',
			oauth_timestamp : now,
			oauth_signature_method : 'HMAC-SHA1',
			oauth_version : '1.0'
	};
	
	var endpoint = caliper_profile_endpoint;
    var method = "GET";
    var signature = oauth.generate('GET', caliper_profile_host + caliper_profile_endpoint, parameters, consumer_secret );
    var headers = {
                'Authorization': 'OAuth oauth_nonce="' + parameters.oauth_nonce + '", oauth_timestamp="' + parameters.oauth_timestamp + '", oauth_version="' + parameters.oauth_version + '", oauth_signature_method="' + parameters.oauth_signature_method + '", oauth_consumer_key="' + parameters.oauth_consumer_key + '", oauth_signature="' + signature
    };
    
    var options = {
                host: caliper_profile_host,
                path: endpoint,
                method: method,
                headers: headers
              };

              var http_req = https.request(options, function(http_res) {
                http_res.setEncoding('utf-8');

                var responseString = '';

                http_res.on('data', function(data) {
                  responseString += data;
                });

                http_res.on('end', function() {
                  console.log(responseString);
                  res.render('lti', { title: 'Caliper Response Received!', content: responseString });
                });
              });

              http_req.body = _.omit(http_req.body, '__proto__');
              http_req.write("");
              http_req.end(); */
              
};

exports.outcomes = function(req,res) {
	res.render('outcomes', { title: 'Enter Grade', sourcedid: lis_result_sourcedid, endpoint: lis_outcome_service_url, key: consumer_key, secret: consumer_secret})
};

exports.send_outcomes = function(req,res) {

  var options = {};

  options.consumer_key=req.body.key;
  options.consumer_secret=req.body.secret;
  options.service_url=req.body.url;
  options.source_did=req.body.sourcedid;
  
  var grade = parseFloat(req.body.grade);

  var outcomes_service = new lti.OutcomeService(options);

  outcomes_service.send_replace_result(grade, function(err,result) {
    console.log(result); //True or false
    
    if(result){
        res.render('lti', { title: 'Outcome successfully sent!', content: result });
    }
    else{
        res.render('lti', { title: 'Outcome Failed!', content: err });
    }

  });
};

var send_outcomes = function(endpoint,sourced_id) {
	var options = {};

	  options.consumer_key=consumer_key;
	  options.consumer_secret=consumer_secret;
	  options.service_url=endpoint;
	  options.source_did=sourced_id;

	  var outcomes_service = new lti.OutcomeService(options);

	  outcomes_service.send_replace_result(.5, function(err,result) {
	    console.log(result); //True or false
	    return Boolean(result);
	  })
};
