'use strict';

var request = require('request');

module.exports = {
    'PostIncident': function(parameters, callback){

        var options = { method: 'POST',
        url: 'https://dev65929.service-now.com/api/now/v1/table/incident',
        headers: 
        { 'Postman-Token': '5bbb2cc6-60f8-41e9-abc5-46b5d66c7038',
            'Cache-Control': 'no-cache',
            Authorization: 'Basic YWRtaW46U2h1YmhhbUAxOTk1',
            'Content-Type': 'application/json' },
        body: 
        { short_description: parameters.description,
            comments: '',
            caller_id: 'Pournima Mishra',
            assigned_to: '46d44a23a9fe19810012d100cca80666',
            approval: 'requested',
            category: parameters.category,
            subcategory: parameters.sub_category,
            impact: parameters.impact,
            urgency: parameters.urgency },
        json: true };

        request(options, function (error, response, body) {
            if (error) {
                callback(error, null);
            }

            else{
                callback(null, body);
            }
        })

    }
}