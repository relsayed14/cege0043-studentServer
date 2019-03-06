// express is the server that forms part of the nodejs program
var express = require('express');
var path = require('path');
var app = express();

// code to process the uploaded data
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded ({
	extended: true
}));
app.use(bodyParser.json());

// set up required database connectivity 
// this must be before the app stuff
var fs = require('fs');
var pg = require('pg');

var configtext = ""+fs.readFileSync("/home/studentuser/certs/postGISConnection.js");

// now convert the configuration file into the correct format - i.e. a name/value pair array
var configarray = configtext.split(",");
var config = {};
for (var i = 0; i < configarray.length; i++) {
	var split = configarray[i].split(':');
	config[split[0].trim()] = split[1].trim();
}
var pool = new pg.Pool(config);


//testing out the connection
app.get('/postgistest', function (req,res) {
	pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       }
       client.query('SELECT name FROM london poi', function(err,result) {
           done();
           if(err){
               console.log(err);
               res.status(400).send(err);
}
           res.status(200).send(result.rows);
       });
	}); 
});


// POST request to studentServer.js
app.post('/reflectData', function(req,res) {
	// note that we are using POST here as we are uploading dara
	// so that the parameters form part of the BODY of the requesr rather
	// than the RESTful API
	console.dir(req.body);

	//for now, just echo the request back to the client
	res.send(req.body);
})

// add an http server to serve files to the browser 
// due to the certificate issues, it rejects the https files if they are not
// directly called in a typed URL
var http = require('http');
var httpServer = http.createServer(app);
httpServer.listen(4480);

app.get('/',function(req,res) {
	res.send('hello world from the HTTP server');
});

// adding functionality to log the requests on the console as they come in
app.use(function (req, res, next) {
	var filename = path.basename(req.url);
	var extension = path.extname(filename); 
	console.log("The file " + filename + " was requested."); 
	next();
});


// to allow phonegap to make requests to the server
app.use(function(req,res,next) {
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers","X-Requested-With");
	next();
});


// code to return (serve) any file on the server
// serve static files - e.g. html, css
// this should ALWAYS be the last line in the server file
app.use(express.static(__dirname));