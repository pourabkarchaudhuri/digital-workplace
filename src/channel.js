var actionHandler = require('./action');

module.exports = {
    'DetectChannel': function(payload, type, callback){
        // console.log('Intent Response : ' + JSON.stringify(payload));
        if(type == 'API'){
            console.log("API Request");
            actionHandler.ActionTrigger(payload, payload.result.action, payload.result.actionIncomplete, payload.result.parameters, 'API', (err, result) => {
                callback(null, result);
            });
        }
        else if(type == 'CHANNEL'){
            console.log("Channel Request");
            actionHandler.ActionTrigger(payload, payload.queryResult.action, payload.queryResult.allRequiredParamsPresent, payload.queryResult.parameters, payload.originalDetectIntentRequest.source, (err, result) => {
                callback(null, result);
            });
        }
       //Detect Source and set JSON params to respective data structure
        
    }
}
