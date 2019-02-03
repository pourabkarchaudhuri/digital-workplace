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


                let output = {
                    ticketNumber: 'INC4100321',
                    impact: 'low',
                    severity: 'medium',
                    category: 'inquiry'
                }
                if(source == 'API'){
                    callback(null, ResponseBuilderCard(output))
                }
                else if(source == 'GOOGLE_TELEPHONY'){
                    let speechString = 'The incident request is raised for ticket number ' + output.ticketNumber + ' with a ' + output.severity + ' severity. It will be resolved shortly. Is there anything else I can help you with?';
                    callback(null, ResponseBuilderTelephony(speechString))
                }
                else if(source == 'google'){
                    callback(null, ResponseBuilderGoogleAssistantCard(output));
                }
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

function ResponseBuilderTelephony(data){
    console.log("Framing Telephony Speech with Data : " + data);
    return {
        fulfillmentText : data
    }
}

function ResponseBuilderGoogleAssistantCard(data){
    console.log("Framing Google Assistant Card with Data : " + data);
    let card = {
        "payload": {
            "google": {
            "expectUserResponse": true,
            "richResponse": {
                "items": [
                {
                    "simpleResponse": {
                    "textToSpeech": "this is a simple response"
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
    var card = { "result" : {
                    "fulfillment":{
                    "speech": "",
                    "displayText": "",
                    "messages": [{
                        "type": 1,
                        "platform": "facebook",
                        "title": "HOME BROADBAND",
                        "subtitle": "If you're running multiple devices, part of a big family or streaming on-demand video, then Broadband & nbn™ is just the ticket for your entertainment needs!<br/><br/><br/><br/>",
                        "imageUrl": "https://smb.optus.com.au/opfiles/Shop/Consumer/Assets/Images/Broadband/broadband-NBN-landing-page-3UP.png",
                        "buttons": [{
                            "text": "Show More",
                            "postback": "https://www.optus.com.au/shop/broadband/home-broadband"
                            },
                            {
                            "text": "Select this plan",
                            "postback": "HOME BROADBAND"
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