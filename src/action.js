var classifierHandler = require('../services/ticketClassifier');
var itsmHandler = require('../services/serviceNow');

module.exports = {
    'ActionTrigger': function(event, action, actionIncomplete, parameters, source, callback){
        if(source != 'API'){
            actionIncomplete = false;
        }


        if(action == "IncidentRequest"){
            console.log("Incident Request Intent Triggered!");
            
            if(!actionIncomplete){
                console.log("Params fulfilled");
                //Call ML Model with REST and Get its response
                //Call Service Now with above response params
                //Pass on required formatted response from Service Now below in 'output'

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
                                let output = {
                                    ticketNumber: itsmData.result.number,
                                    impact: itsmData.result.impact,
                                    severity: itsmData.result.severity,
                                    category: itsmData.result.category,
                                    subCategory: itsmData.result.subcategory
                                }

                                if(source == 'API'){
                                    callback(null, ResponseBuilderCard(output))
                                }
                                else if(source == 'GOOGLE_TELEPHONY'){
                                    // let speechString = 'The incident request is raised for ticket number ' + output.ticketNumber + 'to ' + output.category + ' with a ' + output.severity + ' severity. It will be resolved shortly. Is there anything else I can help you with?';
                                    callback(null, ResponseBuilderTelephony(IncidentResponse(output)));
                                }
                                else if(source == 'google'){
                                    // let speechString = 'The incident request is raised for ticket number ' + output.ticketNumber + 'to ' + output.category + ' with a ' + output.severity + ' severity. It will be resolved shortly. Is there anything else I can help you with?';
                                    callback(null, ResponseBuilderGoogleAssistantSimpleResponse(IncidentResponse(output)));
                                }
                            }
    
                        })
                    }
                    
                })



                

            }
            else{
                console.log("Asking Prompts");
                callback(null, event);
            }
        }
        else{
            console.log("Bypass Uninteractive Intents");
            callback(null, event);
        }
        //Add decision tree here for action parsing
    }
}

function IncidentResponse(output){
    let speechString = 'The incident request is raised for ticket number ' + output.ticketNumber + ' to ' + toUpperCase(output.category) + '  under severity level ' + output.severity + '. It will be resolved shortly. Is there anything else I can help you with?';
    return speechString
}

function ResponseBuilderTelephony(data){
    console.log("Framing Telephony Speech with Data : " + data);
    return {
        fulfillmentText : data
    }
}

function ResponseBuilderGoogleAssistantSimpleResponse(data){
    console.log("Framing Google Assistant Card with Data : " + data);
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


function ResponseBuilderCard(data){
    console.log("Framing Card with Data : " + JSON.stringify(data))
    
    var subtitleText = 'The incident request is raised to ' + output.category + ' with a ' + output.severity + ' severity. It will be resolved shortly.';
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

function ResponseBuilderQuickReplies(data){
    console.log("Framing Quick Replies with Data : " + JSON.stringify(data));
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