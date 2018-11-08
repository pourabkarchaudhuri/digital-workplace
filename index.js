'use strict'
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var fs = require('fs');
var path = require('path')
var request = require('request');

require('dotenv').config()
//Load Module dependencies

var ai = require('./services/conversation')

//Configuring the Express Middleware
var app = express();

var accessLogStream = fs.createWriteStream(__dirname + '/logs/access.log', {flags: 'a'})

//Configure Morgan's Logging Formats
// app.use(morgan('common', {stream: accessLogStream}))    //UNCOMMENT TO ENABLE FILE LOGGING
app.use(morgan('common'));


//Set PORT to Dynamic Environments to run on any Server
var port = process.env.PORT || 5000;

//Configure Express to Recieve JSON and extended URLencoded formats
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


app.use(bodyParser.json({
    limit: "50mb"
}))
//Set RESTful routes file size limit

app.get('/', function(req, res) {
  res.send("Server Online");
});
//Route for GET

app.post('/v1/api/query', function(req, res) {
    console.log("Incoming payload!")
    console.log(JSON.stringify(req.body))

    ai.ConversationHandler(req.body, (err, result)=>{
      if(err){
        console.log("Respond with Server Unavailable");
      }

      else{
        console.log("Respond with success");
        res.send(result)
      }
    })
    // var token = req.body.token;
    // var geo = req.body.geo;
    // ai.ConversationHandler((req.))
});

app.listen(port);
console.log("Server started successfully at PORT : " + port);
//module.exports=app;
