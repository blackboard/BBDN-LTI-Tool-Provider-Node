var lti = require('ims-lti');
var caliper = require('ims-caliper');
var _ = require('lodash');
var oauth = require('oauth-signature');
var https = require('https');
var finish = require('finish');

//for testing
var consumer_key = "12345";
var consumer_secret = "secret";
var lis_result_sourcedid = "bbgc46gi65";
var lis_outcome_service_url="https://cdev-saas-original-prod.blackboard.com/webapps/gradebook/lti11grade";
var caliper_profile_url = "https://cdev-saas-original-prod.blackboard.com/learn/api/v1/telemetry/caliper/profile/_224_1";
var caliper_host = 'cdev-saas-original-prod.blackboard.com';
var caliper_path = '/learn/api/v1/telemetry/caliper/profile/_224_1';
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
	  
	var caliper_service = new lti.caliperService(options);

	caliper_service.register_caliper_listener( function(body) {
	    console.log("In lti.js: " + body); //True or false
	    
	    if(body.length <= 0){
	    	 res.render('lti', { title: 'caliper Registration Failed!', content: err });
	    }
	    else{
	    	body = body.substring(9);

	    	var jsonBody = JSON.parse(body);
	    	var content = "caliper Event Store URL: " + jsonBody.eventStoreUrl + "<br />";
	    	content += "caliper API Key: " + jsonBody.apiKey + "<br />";
	        res.render('lti', { title: 'caliper Registration successfully sent!', content: content });
	    }
	});
	    
};

exports.caliper_send = function(req,res) {

    finish(function(async) {
    	// Any asynchronous calls within this function will be captured 
    	// Just wrap each asynchronous call with function 'async'. 
    	// Each asynchronous call should invoke 'done' as its callback. 
    	// 'done' tasks two arguments: error and result. 
    	async('sensor', function(done) { 
    		// Initialize sensor with options
    	    var sensor = caliper.Sensor;
		    sensor.initialize(custom_caliper_federated_session_id,{
		        host: caliper_host,
		        port: '8443',
		        path: caliper_path
		    });
		    
		    done(null,sensor);
    	});
    	
    	async('actor', function(done) {
		    // The Actor for the caliper Event
		    var actor = new caliper.Person("https://example.edu/user/554433");
		    actor.setDateCreated((new Date("2015-08-01T06:00:00Z")).toISOString());
		    actor.setDateModified((new Date("2015-09-02T11:30:00Z")).toISOString());
		    
		    done(null,actor);
    	});
    	
    	async('action', function(done) {    
    		// The Action for the caliper Event
    		var action = caliper.NavigationActions.NAVIGATED_TO;
    		
    		done(null,action);
    	});
    	
    	async('eventObj', function(done) {    
    		// The Object being interacted with by the Actor
		    var eventObj = new caliper.EPubVolume("https://example.com/viewer/book/34843#epubcfi(/4/3)");
		    eventObj.setName("The Glorious Cause: The American Revolution, 1763-1789 (Oxford History of the United States)");
		    eventObj.setVersion("2nd ed.");
		    eventObj.setDateCreated((new Date("2015-08-01T06:00:00Z")).toISOString());
		    eventObj.setDateModified((new Date("2015-09-02T11:30:00Z")).toISOString());
		    
		    done(null,eventObj);
    	});
    	
    	async('target', function(done) {    
    		// The Object being interacted with by the Actor
		    var eventObj = new caliper.EPubVolume("https://example.com/viewer/book/34843#epubcfi(/4/3)");
		    eventObj.setName("The Glorious Cause: The American Revolution, 1763-1789 (Oxford History of the United States)");
		    eventObj.setVersion("2nd ed.");
		    eventObj.setDateCreated((new Date("2015-08-01T06:00:00Z")).toISOString());
		    eventObj.setDateModified((new Date("2015-09-02T11:30:00Z")).toISOString());
    	   
    		// The target object (frame) within the Event Object
		    var target = new caliper.Frame("https://example.com/viewer/book/34843#epubcfi(/4/3/1)");
		    target.setName("Key Figures: George Washington");
		    target.setIsPartOf(eventObj)
		    target.setVersion(eventObj.version);
		    target.setIndex(1);
		    target.setDateCreated((new Date("2015-08-01T06:00:00Z")).toISOString());
		    target.setDateModified((new Date("2015-09-02T11:30:00Z")).toISOString());
		    
		    done(null,target);
    	});
    	
    	async('navigatedFrom', function(done) {    
    		// Specific to the Navigation Event - the location where the user navigated from
		    var navigatedFrom = new caliper.WebPage("https://example.edu/politicalScience/2015/american-revolution-101/index.html");
		    navigatedFrom.setName("American Revolution 101 Landing Page");
		    navigatedFrom.setVersion("1.0");
		    navigatedFrom.setDateCreated((new Date("2015-08-01T06:00:00Z")).toISOString());
		    navigatedFrom.setDateModified((new Date("2015-09-02T11:30:00Z")).toISOString());
		    
		    done(null,navigatedFrom);
    	});
    	
    	async('edApp', function(done) {    
    		// The edApp that is part of the Learning Context
		    var edApp = new caliper.SoftwareApplication("https://example.com/viewer");
		    edApp.setName("ePub");
		    edApp.setDateCreated((new Date("2015-08-01T06:00:00Z")).toISOString());
		    edApp.setDateModified((new Date("2015-09-02T11:30:00Z")).toISOString());
		    
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
		    var courseSection = new caliper.CourseSection("https://example.edu/politicalScience/2015/american-revolution-101/section/001");
		    courseSection.setName("American Revolution 101");
		    courseSection.setCourseNumber("POL101");
		    courseSection.setAcademicSession("Fall-2015");
		    courseSection.setSubOrganizationOf(courseOffering);
		    courseSection.setDateCreated((new Date("2015-08-01T06:00:00Z")).toISOString());
		    courseSection.setDateModified((new Date("2015-09-02T11:30:00Z")).toISOString());
    	    
    		// LIS Group
		    var group = new caliper.Group("https://example.edu/politicalScience/2015/american-revolution-101/section/001/group/001");
		    group.setName("Discussion Group 001");
		    group.setSubOrganizationOf(courseSection);
		    group.setDateCreated((new Date("2015-08-01T06:00:00Z")).toISOString());
		    
		    done(null,group);
    	});
    	
    	async('membership', function(done) {
    		var actorId = "https://example.edu/user/554433";
    		var courseSectionId = "https://example.edu/politicalScience/2015/american-revolution-101/section/001";
    		
    		// The Actor's Membership
		    var membership = new caliper.Membership("https://example.edu/politicalScience/2015/american-revolution-101/roster/554433");
		    membership.setName("American Revolution 101");
		    membership.setDescription("Roster entry");
		    membership.setMember(actorId);
		    membership.setOrganization(courseSectionId);
		    membership.setRoles([caliper.Role.LEARNER]);
		    membership.setStatus(caliper.Status.ACTIVE);
		    membership.setDateCreated((new Date("2015-08-01T06:00:00Z")).toISOString());
		    
		    done(null,membership);
    	});
    	
    }, function(err, results) {
	        var event = new caliper.NavigationEvent();
	        event.setActor(results['actor']);
	        event.setAction(results['action']);
	        event.setObject(results['eventObj']);
	        event.setTarget(results['target']);
	        event.setNavigatedFrom(results['navigatedFrom']);
	        event.setEventTime((new Date("2015-09-15T10:15:00Z")).toISOString());
	        event.setEdApp(results['edApp']);
	        event.setGroup(results['group']);
	        event.setMembership(results['membership']);
	        event.setFederatedSession("https://example.edu/lms/federatedSession/123456789");
	
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
        	console.log("Sensor: " + results['sensor'].ToS + " Actor: " + results['actor'] + " Action: " +  results['action'] + " Object: " + results['evenObj'] + " Target: " + results['target'] + " NavigatedFrom: " + results['navigatedFor'] + " EdApp: " + results['edApp'] + " Group: " + results['group'] + " Membership: " + results['membership']);
        	
        	res.send('201',envelope);
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
