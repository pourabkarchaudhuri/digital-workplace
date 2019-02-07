'use strict';

var request = require("request");

module.exports = {
    'GetClassification': function(parameters, callback){
        console.log("Description Input : ", parameters.desc);
        var options = { method: 'POST',
        url: 'https://oou69odffl.execute-api.ap-south-1.amazonaws.com/v1/predict',
        headers: 
        {   'Postman-Token': '9275db51-fc97-4961-9f0f-f887bea56c63',
            'cache-control': 'no-cache',
            'Content-Type': 'application/json',
            'x-api-key': 'bs2Diex8N59LN90Gunwph2lCWyresrIC1zq6l4mI' },
        body: { description: parameters.desc },
        json: true };

        request(options, function (error, response, body) {
            if (error) {
                callback(error, null);
            }

            else{
                console.log("Classifier Result : " + JSON.stringify(body));
                callback(null, body);
            }
        });

    }
}

