
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , lti = require('./routes/lti')
  , http = require('http')
  , path = require('path')
  , eventstore = require('./routes/eventstore');

var app = express();

// all environments
app.set('port', 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.post('/caliper/send', lti.caliper_send);
app.post('/caliper/register', lti.caliper);
app.post('/caliper', eventstore.got_caliper);
app.get('/caliper', eventstore.show_events);
app.post('/rest/auth', lti.rest_auth);
app.post('/rest/user', lti.rest_getuser);
app.post('/rest/course', lti.rest_getcourse);
app.post('/lti/outcomes', lti.outcomes);
app.post('/lti/send_outcomes', lti.send_outcomes);
app.post('/lti', lti.got_launch);
app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

