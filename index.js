'use strict'
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');

var scribe = require('scribe-js')(),
    app    = express();

app.use('/logs', scribe.webPanel());

require('dotenv').config()

var ai = require('./services/conversation')
var intent = require('./src/intent');

app.use(morgan('common'));
app.use(scribe.express.logger());

var port = process.env.PORT || 5000;

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(bodyParser.json({
    limit: "50mb"
}))

var console = process.console;

app.get('/', function(req, res) {
  res.send("Server Online");
});
//Route for GET


// With log(...)
// console.log("Hello World!");
// console.info("Hello World!");
// console.error("Hello World!");
// console.warning("Hello World!");

app.post('/v1/api/query', function(req, res) {
    console.log("Incoming payload!")
    console.log(JSON.stringify(req.body))

    ai.ConversationHandler(req.body, (err, result)=>{
      if(err){
        console.log("Respond with Server Unavailable");
      }
      else{
        intent.IntentParser(result, (err, result) => {
          res.json(result);
        })
      }
    })
});

app.post('/v1/api/channel', function(req, res) {
  console.log("Incoming Channel!")
  console.log(JSON.stringify(req.body))
});

app.listen(port);
console.log("Server started successfully at PORT : " + port);
//module.exports=app;
