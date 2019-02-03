module.exports = {
    'IntentParser': function(payload, callback){
        console.log("Channel Response : " + JSON.stringify(payload));
        if(payload.queryResult.action == "IncidentRequest"){
            
        }
        if(payload.hasOwnProperty('originalDetectIntentRequest')){
            console.log('Property Detected');

            if(payload.originalDetectIntentRequest.source == "GOOGLE_TELEPHONY"){
                console.log("Telephony Input");
                callback(null, {
                    fulfillmentText: "This is the server response"
                })
            }
        }
    }
}