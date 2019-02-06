var classifierHandler = require('../services/ticketClassifier');
var itsmHandler = require('../services/serviceNow');

module.exports = {
    'ActionTrigger': function(event, action, actionIncomplete, parameters, source, callback){
        if(source != 'API'){
            actionIncomplete = false;
        }

        if(action == "IncidentRequest"){
            
            if(!actionIncomplete){

                classifierHandler.GetClassification(parameters, (err, classifiedData) => {

                    if(err){
                        //Handle Error Message
                        
                    }
                    else{
                        itsmHandler.PostIncident(classifiedData, (err, itsmData) => {
                            if(err){
                                //Handle Error message
                            }
                            else{
                                var output = {
                                    ticketNumber: itsmData.result.number,
                                    impact: itsmData.result.impact,
                                    severity: itsmData.result.severity,
                                    category: itsmData.result.category,
                                    subCategory: itsmData.result.subcategory
                                }
                                
                                console.log('Output : ', output);
                                console.log('Source : ', source);
                                if(source == 'API'){
                                    callback(null, IncidentCreationWebCard(output))
                                }
                                else if(source == 'GOOGLE_TELEPHONY'){
                                    // let speechString = 'The incident request is raised for ticket number ' + output.ticketNumber + 'to ' + output.category + ' with a ' + output.severity + ' severity. It will be resolved shortly. Is there anything else I can help you with?';
                                    callback(null, ResponseBuilderTelephony(IncidentCreation(output)));
                                }
                                else if(source == 'google'){
                                    // let speechString = 'The incident request is raised for ticket number ' + output.ticketNumber + 'to ' + output.category + ' with a ' + output.severity + ' severity. It will be resolved shortly. Is there anything else I can help you with?';
                                    callback(null, ResponseBuilderGoogleAssistantSimpleResponse(IncidentCreation(output)));
                                }
                            }
    
                        })
                    }
                    
                })

            }
            else{
                // console.log("Asking Prompts");
                callback(null, event);
            }
        }

        else if(action == "IncidentStatus"){

            if(!actionIncomplete){

                itsmHandler.GetIncident(parameters, (err, itsmData) => {

                    if(err){
                        //Handler err
                    }

                    else{
                        
                        var ticketActivity;
                        if(itsmData.result.active == "true"){
                            ticketActivity = "active"
                        }
                        else{
                            ticketActivity = "closed"
                        }
                        var output = {
                            ticketNumber: itsmData.result.number,
                            impact: itsmData.result.impact,
                            severity: itsmData.result.severity,
                            category: itsmData.result.category,
                            subCategory: itsmData.result.subcategory,
                            description: itsmData.result.short_description,
                            activity: ticketActivity
                        }

                        if(source == 'API'){
                            callback(null, ResponseBuilderWebSimpleResponse(IncidentFetch(output)))
                        }
                        else if(source == 'GOOGLE_TELEPHONY'){
                            // let speechString = 'The incident request is raised for ticket number ' + output.ticketNumber + 'to ' + output.category + ' with a ' + output.severity + ' severity. It will be resolved shortly. Is there anything else I can help you with?';
                            callback(null, ResponseBuilderTelephony(IncidentFetch(output)));
                        }
                        else if(source == 'google'){
                            // let speechString = 'The incident request is raised for ticket number ' + output.ticketNumber + 'to ' + output.category + ' with a ' + output.severity + ' severity. It will be resolved shortly. Is there anything else I can help you with?';
                            callback(null, ResponseBuilderGoogleAssistantSimpleResponse(IncidentFetch(output)));
                        }

                    }

                })
            }
            else{
                // console.log("Asking Prompts");
                callback(null, event);
            }

        }
        else{
            // console.log("Bypass Uninteractive Intents");
            callback(null, event);
        }
        //Add decision tree here for action parsing
    }
}

function IncidentFetch(output){
    let speechString = 'The incident request ' + output.ticketNumber + ' with description, ' + output.description + ' is ' + output.activity + '. Is there anything else I can help you with?';
    return speechString
}

function IncidentCreation(output){
    let speechString = 'I have raised your incident request is raised for ticket number ' + output.ticketNumber + ' to ' + output.category.toUpperCase() + ' under severity level ' + output.severity + '. It will be resolved shortly. Is there anything else I can help you with?';
    return speechString
}

function ResponseBuilderTelephony(data){
    // console.log("Framing Telephony Speech with Data : " + data);
    return {
        fulfillmentText : data
    }
}

function ResponseBuilderGoogleAssistantSimpleResponse(data){
    // console.log("Framing Google Assistant Speech with Data : " + data);
    let card = {
        "payload": {
            "google": {
            "expectUserResponse": true,
            "richResponse": {
                "items": [
                {
                    "simpleResponse": {
                    "textToSpeech": data
                    }
                }
                ]
            }
            }
        }
        }
    return card;
}


function IncidentCreationWebCard(data){
    // console.log("Framing Card with Data : " + JSON.stringify(data))
    
    var subtitleText = 'The incident request is raised to ' + data.category + ' with a ' + data.severity + ' severity. It will be resolved shortly.';
    var statusPostback = "check status of " + data.ticketNumber;
    var card = { "result" : {
                    "fulfillment":{
                    "speech": "",
                    "displayText": "",
                    "messages": [{
                        "type": 1,
                        "platform": "facebook",
                        "title": data.ticketNumber,
                        "subtitle": subtitleText,
                        "imageUrl": "https://smb.optus.com.au/opfiles/Shop/Consumer/Assets/Images/Broadband/broadband-NBN-landing-page-3UP.png",
                        "buttons": [{
                            "text": "Status",
                            "postback": statusPostback
                            }
                        ]
                    }
                ]
            }        
        }
    }

    return card;
}

function ResponseBuilderWebSimpleResponse(data){
    var text = { 
        "result" : {
            "fulfillment":{
            "speech": data,
            "displayText": data
            }
        }
    }

    return text
}

function ResponseBuilderQuickReplies(data){
    // console.log("Framing Quick Replies with Data : " + JSON.stringify(data));
        var quickReply ={ "result" : {
            "fulfillment":{
                "speech": "",
                "displayText": "",
                "messages": [{
                    "type": 4,
                    "platform": "facebook",
                    "payload": {
                        "facebook": {
                            "text": `Do you want to buy `,
                            "quick_replies": [{
                                    "content_type": "text",
                                    "title": "Yes",
                                    "payload": "Yes"
                                }, {
                                    "content_type": "text",
                                    "title": "No",
                                    "payload": "No"
                                }]
                        }
                    }
                }]
            }
        }
    };

    return quickReply;
}