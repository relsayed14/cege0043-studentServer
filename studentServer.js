// express is the server that forms part of the nodejs program
var express = require('express');
var path = require('path');
var app = express();

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

// code to return (serve) any file on the server
// serve static files - e.g. html, css
// this should ALWAYS be the last line in the server file
app.use(express.static(__dirname));