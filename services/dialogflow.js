'use strict';

var request = require('request')

module.exports = {
  'DialogflowAPI': function(payload, callback) {
      // console.log("Outgoing Query to AI : " + payload.query)
      var options = { method: 'POST',
        url: 'https://api.dialogflow.com/v1/query',
        qs: { v: '20150910' },
        headers:
         { 'cache-control': 'no-cache',
           charset: 'utf-8',
           'Content-Type': 'application/json',
           Authorization: 'Bearer 427b90044ede46d28b8e293f54bea788'
          },
        body:
         { lang: payload.lang,
           query: payload.query,
           sessionId: payload.sessionId,
           timezone: 'America/New_York' },
        json: true };

      request(options, function (error, response, body) {
        if (error) {
          // console.log("Error from conversation engine");
          callback(error, null)
        }
        else{
          // console.log("Response from conversation engine : " + JSON.stringify(body))
          callback(null, body)
        }
      });

  }
}
