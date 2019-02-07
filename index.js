'use strict'
// var http = require('http');
var os = require('os');
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var dash = require('appmetrics-dash');
var appMetrics = require('appmetrics');
var osutils = require('os-utils');
var scribe = require('scribe-js')(),
    app    = express();

app.use('/logs', scribe.webPanel());

require('dotenv').config()

var aiHandler = require('./services/dialogflow')
var channelHandler = require('./src/channel');

app.use(morgan('common'));
app.use(scribe.express.logger());

var port = process.env.PORT || 5000;

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(bodyParser.json({
    limit: "50mb"
}))

dash.monitor(appMetrics);

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
    // console.log("Incoming payload!")
    console.log("Event : " + JSON.stringify(req.body));

    if(req.body.hasOwnProperty('originalDetectIntentRequest')){
      // console.log('Platform Webhook Detected');

      channelHandler.DetectChannel(req.body, 'CHANNEL', (err, result) => {
        res.json(result);
      })
    }
    else{
      // console.log("API Request Detected");
      aiHandler.DialogflowAPI(req.body, (err, response)=>{
        if(err){
          console.error("Response with dialogflow unavailable");
        }
        else{
          channelHandler.DetectChannel(response, 'API', (err, result) => {
            console.log("Response : " + JSON.stringify(result))
            res.json(result);
          })
        }
      })
    }
    
});

app.get('/v1/api/metrics', function(req, res) {

    res.json({
      hostname: os.hostname(),
      osType: os.type(),
      platform: osutils.platform(),
      loadAverage: osutils.loadavg(5),
      totalMemory: osutils.totalmem().toFixed(2) + " MB",
      freeMemory: osutils.freemem().toFixed(2) + " MB",
      freeMemoryPercentage: osutils.freememPercentage().toFixed(2) + " %",
      systemUptime: osutils.sysUptime().toFixed(2) + " ms" 
    })
});
app.listen(port);
console.log("Server started successfully at PORT : " + port);
//module.exports=app;
