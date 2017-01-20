var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var movies = require('./routes/movies'); //routes are defined here
var dbConfig =  require('./db-config'); //database configuration
var session = require('./session-config'); //session

//connect to the database
var connectionString = 'mongodb://';
if(dbConfig.username !== "" && dbConfig.password !== ""){
	connectionString += dbConfig.username+':'+dbConfig.password+'@';
}
connectionString+= dbConfig.host+':'+dbConfig.port+'/'+dbConfig.database
mongoose.connect(connectionString);

var app = express(); //Create the Express app
//session configuration
app.use(session);
//static folder declaration
app.use('/bower_components', express.static('bower_components'));
// set the view engine to ejs
app.set('view engine', 'ejs');
//configure body-parser
app.use(bodyParser.urlencoded());
//This is our route middleware
app.use('/movies', movies); 

app.set('port', process.env.PORT || 8000);
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});




