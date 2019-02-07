var classifierHandler = require('../services/ticketClassifier');
var itsmHandler = require('../services/serviceNow');
var jaroWrinklerHandler = require('../nlp/jaroWrinkler');

module.exports = {
    'ActionTrigger': function(event, action, actionIncomplete, parameters, source, callback){
        if(source != 'API'){
            actionIncomplete = false;
        }

        if(action == "IncidentRequest"){
            
            if(!actionIncomplete){

                itsmHandler.GetAllIncident((err, itsmData) => {
                    if(err){
                        //Handle Service Now Call err
                    }
                    else{

                        jaroWrinklerHandler.StringDistance(parameters, itsmData, (err, distanceResult) => {
                            if(err){
                                //Handle Jaro Wrinkler Handler err
                                
                            }
                            else{
                                console.log("Input : ", parameters.desc);
                                console.log("Jaro Wrinkler Results : " + JSON.stringify(distanceResult));
                                if(distanceResult.matched){
                                    //true
                                    //No ML
                                    //PUT
                                    console.log('PUT REQUEST TO be implemented');
                                    itsmHandler.PutIncident(distanceResult.result, (err, result) => {

                                        var output = {
                                            ticketNumber: distanceResult.result.incidentNumber,
                                            description: distanceResult.result.incidentDescription
                                        }
                                        if(source == 'API'){
                                            callback(null, IncidentCreationWebCard(output))
                                        }
                                        else if(source == 'GOOGLE_TELEPHONY'){
                                            // let speechString = 'The incident request is raised for ticket number ' + output.ticketNumber + 'to ' + output.category + ' with a ' + output.severity + ' severity. It will be resolved shortly. Is there anything else I can help you with?';
                                            callback(null, ResponseBuilderTelephony(IncidentUpdate(output)));
                                        }
                                        else if(source == 'google'){
                                            // let speechString = 'The incident request is raised for ticket number ' + output.ticketNumber + 'to ' + output.category + ' with a ' + output.severity + ' severity. It will be resolved shortly. Is there anything else I can help you with?';
                                            callback(null, ResponseBuilderGoogleAssistantSimpleResponse(IncidentUpdate(output)));
                                        }
                                    })
                                }
                                else{
                                    //false = no match
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

                var number;
                if(source != 'API'){
                    number = event.queryResult.queryText.replace(/[^0-9]/g, "");
                    number = number.replace(/ /g, "");
                }
                else if(source == "API"){
                    // console.log("Query : ", event);
                    number = event.result.resolvedQuery.replace(/[^0-9]/g, "");
                    number = number.replace(/ /g, "");
                }
                
                console.log('Number Obtained : ', number);
                itsmHandler.GetIncident(number, (err, itsmData) => {

                    if(err){
                        //Handler err
                    }

                    else{
                        
                        if(itsmData.hasOwnProperty('error')){
                            if(source == 'API'){
                                callback(null, ResponseBuilderWebSimpleResponse(IncidentFetchNoResult()));
                            }
                            else if(source == 'GOOGLE_TELEPHONY'){
                                // let speechString = 'The incident request is raised for ticket number ' + output.ticketNumber + 'to ' + output.category + ' with a ' + output.severity + ' severity. It will be resolved shortly. Is there anything else I can help you with?';
                                callback(null, ResponseBuilderTelephony(IncidentFetchNoResult()));
                            }
                            else if(source == 'google'){
                                // let speechString = 'The incident request is raised for ticket number ' + output.ticketNumber + 'to ' + output.category + ' with a ' + output.severity + ' severity. It will be resolved shortly. Is there anything else I can help you with?';
                                callback(null, ResponseBuilderGoogleAssistantSimpleResponse(IncidentFetchNoResult()));
                            }
                        }
                        else{
                            // console.log("Service Now Fetch Result : " + JSON.stringify(itsmData.result[0]));
                            var ticketActivity;
                            if(itsmData.result[0].active == "true"){
                                ticketActivity = "active"
                            }
                            else{
                                ticketActivity = "closed"
                            }
                            var output = {
                                ticketNumber: itsmData.result[0].number,
                                impact: itsmData.result[0].impact,
                                severity: itsmData.result[0].severity,
                                category: itsmData.result[0].category,
                                subCategory: itsmData.result[0].subcategory,
                                description: itsmData.result[0].short_description,
                                activity: ticketActivity
                            }

                            console.log("Output : ", output);
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



function IncidentFetchNoResult(){
    let speechString = 'There currently no tickets with that number. Do you want to try again?';
    return speechString
}

function IncidentUpdate(output){
    let speechString = 'I found an existing ticket The incident request ' + output.ticketNumber + ' with description, ' + output.description + '. I have added a comment on this ticket giving a gentle reminder to help resolve it quickly. Is there anything else I can help you with?';
    return speechString
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

function ResponseBuilderWebSimpleResponse(data){
    return {
             "result" : {
                "fulfillment":{
                "messages": [{
                    "type": 0,
                    "platform": "facebook",
                    "speech": data
                    }
                ]
            }        
        }
    
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