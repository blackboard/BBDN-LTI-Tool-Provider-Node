var lti = require('ims-lti');
var caliper = require('ims-caliper');
var _ = require('lodash');
var oauth = require('oauth-signature');
var https = require('https');
var finish = require('finish');
const util = require('util');

//for testing
var consumer_key = "12345";
var consumer_secret = "secret";
var lis_result_sourcedid = "bbgc46gi65";
var lis_outcome_service_url="https://ultra-integ.int.bbpd.io/webapps/gradebook/lti11grade";
var caliper_profile_url = "https://ultra-integ.int.bbpd.io/learn/api/v1/telemetry/caliper/profile/_268383_1";
var caliper_host = 'ultra-integ.int.bbpd.io';
var caliper_path = '/learn/api/v1/telemetry/caliper/profile/_268383_1';
var custom_caliper_federated_session_id = "https://caliper-mapping.cloudbb.blackboard.com/v1/sites/62bca10c-bad8-4aa7-be05-ae779ce67919/sessions/D9F03CA3CE92715F2ECE3928D0967081";

var oauth_consumer_key = '12345';
var oauth_nonce = '2666261012817';



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
 	 oauth_consumer_key = req.body['oauth_consumer_key'];
 	 oauth_nonce = req.body['oauth_nonce'];
 	 
 	 res.render('lti', { title: 'LTI Launch Received!', content: content });
     }
  });
};

exports.caliper = function(req, res) {

		var options = {};

		options.consumer_key=consumer_key;
		options.consumer_secret=consumer_secret;
		options.caliper_profile_url=caliper_profile_url;
		
		  
		var now = + new Date();
		var nonce = new Date().getTime() + '' + new Date().getMilliseconds();
		
		var parameters = {
				'oauth_consumer_key' : oauth_consumer_key,
				'oauth_nonce' : nonce,
				'oauth_timestamp' : now,
				'oauth_signature_method' : 'HMAC-SHA1',
				'oauth_version' : '1.0'
		};
		
		var endpoint = caliper_path;
	    var method = "GET";
	    var signature = oauth.generate('GET', caliper_host + caliper_path, parameters, consumer_secret );
	    var headers = {
	                'Authorization': 'OAuth oauth_nonce="' + parameters.oauth_nonce + '", oauth_timestamp="' + parameters.oauth_timestamp + '", oauth_version="' + parameters.oauth_version + '", oauth_signature_method="' + parameters.oauth_signature_method + '", oauth_consumer_key="' + parameters.oauth_consumer_key + '", oauth_signature="' + signature + '"'
	    };
	    console.log(headers);
	    
	    var options = {
	                host: caliper_host,
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
	    http_req.end();
	              
	};	    

exports.caliper_send = function(req,res) {

    finish(function(async) {
    	
    	var actorId = "https://example.edu/user/554433";
		var courseSectionId = "https://example.edu/politicalScience/2015/american-revolution-101/section/001";
		
    	// Any asynchronous calls within this function will be captured 
    	// Just wrap each asynchronous call with function 'async'. 
    	// Each asynchronous call should invoke 'done' as its callback. 
    	// 'done' tasks two arguments: error and result. 
    	async('sensor', function(done) { 
    		// Initialize sensor with options
    	    var sensor = caliper.Sensor;
		    sensor.initialize(custom_caliper_federated_session_id,{
		        host: caliper_host,
		        path: caliper_path
		    });
		    
		    done(null,sensor);
    	});
    	
    	async('actor', function(done) {
		    // The Actor for the caliper Event
		    var actor = new caliper.Person(actorId);
		    actor.setDateCreated((new Date()).toISOString());
		    actor.setDateModified((new Date()).toISOString());
		    
		    done(null,actor);
    	});
    	
    	async('action', function(done) {    
    		// The Action for the caliper Event
    		var action = caliper.NavigationActions.NAVIGATED_TO;
    		
    		done(null,action);
    	});
    	
    	async('target', function(done) {    
    		// The Object being interacted with by the Actor
		    var eventObj = new caliper.EPubVolume("https://example.com/viewer/book/34843#epubcfi(/4/3)");
		    eventObj.setName("The Glorious Cause: The American Revolution, 1763-1789 (Oxford History of the United States)");
		    eventObj.setVersion("2nd ed.");
		    eventObj.setDateCreated((new Date()).toISOString());
		    eventObj.setDateModified((new Date()).toISOString());
    	   
    		// The target object (frame) within the Event Object
		    var target = new caliper.Frame("https://example.com/viewer/book/34843#epubcfi(/4/3/1)");
		    target.setName("Key Figures: George Washington");
		    target.setIsPartOf(eventObj)
		    target.setVersion(eventObj.version);
		    target.setIndex(1);
		    target.setDateCreated((new Date()).toISOString());
		    target.setDateModified((new Date()).toISOString());
		    
		    done(null,target);
    	});
    	
    	async('navigatedFrom', function(done) {    
    		// Specific to the Navigation Event - the location where the user navigated from
		    var navigatedFrom = new caliper.WebPage("https://example.edu/politicalScience/2015/american-revolution-101/index.html");
		    navigatedFrom.setName("American Revolution 101 Landing Page");
		    navigatedFrom.setVersion("1.0");
		    navigatedFrom.setDateCreated((new Date()).toISOString());
		    navigatedFrom.setDateModified((new Date()).toISOString());
		    
		    done(null,navigatedFrom);
    	});
    	
    	async('edApp', function(done) {    
    		// The edApp that is part of the Learning Context
		    var edApp = new caliper.SoftwareApplication("https://example.com/viewer");
		    edApp.setName("ePub");
		    edApp.setDateCreated((new Date()).toISOString());
		    edApp.setDateModified((new Date()).toISOString());
		    
		    done(null,edApp);
    	});
    	
    	async('group', function(done) {    
    		// LIS Course Offering
		    var courseOffering = new caliper.CourseOffering("https://example.edu/politicalScience/2015/american-revolution-101");
		    courseOffering.setName("Political Science 101: The American Revolution");
		    courseOffering.setCourseNumber("POL101");
		    courseOffering.setAcademicSession("Fall-2015");
		    courseOffering.setSubOrganizationOf(null);
		    courseOffering.setDateCreated((new Date("2015-08-01T06:00:00Z")).toISOString());
		    courseOffering.setDateModified((new Date("2015-09-02T11:30:00Z")).toISOString());
    	  
    		// LIS Course Section
		    var courseSection = new caliper.CourseSection(courseSectionId);
		    courseSection.setName("American Revolution 101");
		    courseSection.setCourseNumber("POL101");
		    courseSection.setAcademicSession("Fall-2015");
		    courseSection.setSubOrganizationOf(courseOffering);
		    courseSection.setDateCreated((new Date()).toISOString());
		    courseSection.setDateModified((new Date()).toISOString());
    	    
    		// LIS Group
		    var group = new caliper.Group("https://example.edu/politicalScience/2015/american-revolution-101/section/001/group/001");
		    group.setName("Discussion Group 001");
		    group.setSubOrganizationOf(courseSection);
		    group.setDateCreated((new Date()).toISOString());
		    
		    done(null,group);
    	});
    	
    	async('membership', function(done) {
    		// The Actor's Membership
		    var membership = new caliper.Membership("https://example.edu/politicalScience/2015/american-revolution-101/roster/554433");
		    membership.setName("American Revolution 101");
		    membership.setDescription("Roster entry");
		    membership.setMember(actorId);
		    membership.setOrganization(courseSectionId);
		    membership.setRoles([caliper.Role.LEARNER]);
		    membership.setStatus(caliper.Status.ACTIVE);
		    membership.setDateCreated((new Date()).toISOString());
		    
		    done(null,membership);
    	});
    	
    }, function(err, results) {
	        var event = new caliper.NavigationEvent();
	        event.setActor(results['actor']);
	        event.setAction(results['action']);
	        event.setObject(results['target'].isPartOf);
	        event.setTarget(results['target']);
	        event.setNavigatedFrom(results['navigatedFrom']);
	        event.setEventTime((new Date()).toISOString());
	        event.setEdApp(results['edApp']);
	        event.setGroup(results['group']);
	        event.setMembership(results['membership']);
	        event.setFederatedSession(custom_caliper_federated_session_id);
	
	        console.log('created navigation event %O', event);
	
	        var currentTimeMillis = (new Date()).getTime().toISOString;
	
	        // Send the Event
	        var envelope = new caliper.Envelope();
	        envelope.setSensor(caliper_profile_url);
	        envelope.setSendTime(currentTimeMillis);
	        envelope.setData(event);
	
	        console.log('created event envelope %O', envelope);

	        var sensor = results['sensor'];
	        
        	sensor.send(envelope);
        	// This callback is invoked after all asynchronous calls finish 
        	// or as soon as an error occurs 
        	// results is an array that contains result of each asynchronous call 
        	console.log('Sensor: %O Actor: %O Action: %O Object: %O Target: %O NavigatedFrom: %O EdApp: %O Group: %O Membership: %O',results['sensor'],results['actor'],results['action'],results['eventObj'],results['target'],results['navigatedFrom'],results['edApp'],results['group'],results['membership']);
        	console.log('eventObj from target: %O', results['target'].isPartOf);
        	
        	var content = util.inspect(envelope);
        	
        	console.log('Content1: ' + content);
        	
        	res.render('lti', { title: 'Caliper event successfully sent!', content: content });
    });
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
