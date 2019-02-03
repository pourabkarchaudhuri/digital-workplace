
module.exports = {
    'IntentParser': function(payload, callback){
        console.log('Intent Response : ' + JSON.stringify(payload));
        console.log('Intent Name : ', payload.result.action);

        var action = payload.result.action;
        var actionIncomplete = payload.result.actionIncomplete;
        var parameters = payload.result.parameters;
        
        if(payload.hasOwnProperty('originalDetectIntentRequest')){
            if(payload.originalDetectIntentRequest.source == "GOOGLE_TELEPHONY"){
                console.log("Response from Telephone!");
                callback(null, {
                    fulfillmentText : "This is the response for telephony"
                })
            }
        }
        else{
            console.log("Response from Exposed API");
            if(action == "IncidentRequest"){
                console.log("Incident Request Intent Triggered!");
                if(!actionIncomplete){
                    console.log("Params fulfilled");
                    //Call ML Model with REST and Get its response
                    //Call Service Now with above response params
                    //Pass on required formatted response from Service Now below::
    
                    callback(null, ResponseBuilderCard(parameters))
                }
                else{
                    console.log("Asking Prompts");
                    callback(null, payload);
                }
            }
            else{
                console.log("Bypass Uninteractive Intents");
                callback(null, payload);
            }
        }

        
    }
}

function ResponseBuilderText(data){
    console.log("Framing Text with Data : " + JSON.stringify(data))
    var text = { "result" : {
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

    return text;
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
