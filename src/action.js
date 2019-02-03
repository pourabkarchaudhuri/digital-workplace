var ApiAiApp = require('actions-on-google').ApiAiApp;

module.exports = {
    'ActionTrigger': function(req, res, event, action, actionIncomplete, parameters, source, callback){
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
                    const assistant = new ApiAiApp({request: req, response: res});
                    ResponseBuilderGoogleAssistantCard(assistant, output);
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

//---------------------------------------------RESPONSE BUILDERS--------------------------------------
function ResponseBuilderTelephony(data){
    console.log("Framing Telephony Speech with Data : " + data);
    return {
        fulfillmentText : data
    }
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


function ResponseBuilderGoogleAssistantCard (app, data) {


    app.ask(app.buildRichResponse()
      .addSimpleResponse({speech: 'hello there!', displayText: 'Hello there!'})
      .addSimpleResponse({
        speech: 'I can show you basic cards, lists and carousels as well as ' +
          'suggestions on your phone',
        displayText: 'I can show you basic cards, lists and carousels as ' +
          'well as suggestions'})
      .addSuggestions(
        ['Basic Card', 'List', 'Carousel', 'Suggestions']));

  }

  function normalAsk (app) {
    app.ask('Ask me to show you a list, carousel, or basic card');
  }

   // Suggestions
  function suggestions (app) {
    app.ask(app
      .buildRichResponse()
      .addSimpleResponse('This is a simple response for suggestions')
      .addSuggestions('Suggestion Chips')
      .addSuggestions(['Basic Card', 'List', 'Carousel'])
      .addSuggestionLink('Suggestion Link', 'https://assistant.google.com/'));
  }

  // Basic card
  function basicCard (app) {
    app.ask(app.buildRichResponse()
      .addSimpleResponse('This is the first simple response for a basic card')
      .addSuggestions(
        ['Basic Card', 'List', 'Carousel', 'Suggestions'])
        // Create a basic card and add it to the rich response
      .addBasicCard(app.buildBasicCard(`This is a basic card.  Text in a
      basic card can include "quotes" and most other unicode characters
      including emoji 📱.  Basic cards also support some markdown
      formatting like *emphasis* or _italics_, **strong** or __bold__,
      and ***bold itallic*** or ___strong emphasis___ as well as other things
      like line  \nbreaks`) // Note the two spaces before '\n' required for a
                            // line break to be rendered in the card
        .setSubtitle('This is a subtitle')
        .setTitle('Title: this is a title')
        .addButton('This is a button', 'https://assistant.google.com/')
        .setImage(IMG_URL_AOG, 'Image alternate text'))
      .addSimpleResponse({ speech: 'This is the 2nd simple response ',
        displayText: 'This is the 2nd simple response' })
    );
  }

  // List
  function list (app) {
    app.askWithList(app.buildRichResponse()
      .addSimpleResponse('This is a simple response for a list')
      .addSuggestions(
        ['Basic Card', 'List', 'Carousel', 'Suggestions']),
      // Build a list
      app.buildList('List Title')
        // Add the first item to the list
        .addItems(app.buildOptionItem(SELECTION_KEY_ONE,
          ['synonym of title 1', 'synonym of title 2', 'synonym of title 3'])
          .setTitle('Title of First List Item')
          .setDescription('This is a description of a list item')
          .setImage(IMG_URL_AOG, 'Image alternate text'))
        // Add the second item to the list
        .addItems(app.buildOptionItem(SELECTION_KEY_GOOGLE_HOME,
          ['Google Home Assistant', 'Assistant on the Google Home'])
          .setTitle('Google Home')
          .setDescription('Google Home is a voice-activated speaker powered ' +
            'by the Google Assistant.')
          .setImage(IMG_URL_GOOGLE_HOME, 'Google Home')
        )
        // Add third item to the list
        .addItems(app.buildOptionItem(SELECTION_KEY_GOOGLE_PIXEL,
          ['Google Pixel XL', 'Pixel', 'Pixel XL'])
          .setTitle('Google Pixel')
          .setDescription('Pixel. Phone by Google.')
          .setImage(IMG_URL_GOOGLE_PIXEL, 'Google Pixel')
        )
        // Add last item of the list
        .addItems(app.buildOptionItem(SELECTION_KEY_GOOGLE_ALLO, [])
          .setTitle('Google Allo')
          .setDescription('Introducing Google Allo, a smart messaging app ' +
            'that helps you say more and do more.')
          .setImage(IMG_URL_GOOGLE_ALLO, 'Google Allo Logo')
          .addSynonyms('Allo')
        )
    );
  }

  // Carousel
  function carousel (app) {
    app.askWithCarousel(app.buildRichResponse()
      .addSimpleResponse('This is a simple response for a carousel')
      .addSuggestions(
        ['Basic Card', 'List', 'Carousel', 'Suggestions']),
      app.buildCarousel()
        // Add the first item to the carousel
        .addItems(app.buildOptionItem(SELECTION_KEY_ONE,
          ['synonym of title 1', 'synonym of title 2', 'synonym of title 3'])
          .setTitle('Title of First List Item')
          .setDescription('This is a description of a carousel item')
          .setImage(IMG_URL_AOG, 'Image alternate text'))
        // Add the second item to the carousel
        .addItems(app.buildOptionItem(SELECTION_KEY_GOOGLE_HOME,
          ['Google Home Assistant', 'Assistant on the Google Home'])
          .setTitle('Google Home')
          .setDescription('Google Home is a voice-activated speaker powered ' +
            'by the Google Assistant.')
          .setImage(IMG_URL_GOOGLE_HOME, 'Google Home')
        )
        // Add third item to the carousel
        .addItems(app.buildOptionItem(SELECTION_KEY_GOOGLE_PIXEL,
          ['Google Pixel XL', 'Pixel', 'Pixel XL'])
          .setTitle('Google Pixel')
          .setDescription('Pixel. Phone by Google.')
          .setImage(IMG_URL_GOOGLE_PIXEL, 'Google Pixel')
        )
        // Add last item of the carousel
        .addItems(app.buildOptionItem(SELECTION_KEY_GOOGLE_ALLO, [])
          .setTitle('Google Allo')
          .setDescription('Introducing Google Allo, a smart messaging app ' +
            'that helps you say more and do more.')
          .setImage(IMG_URL_GOOGLE_ALLO, 'Google Allo Logo')
          .addSynonyms('Allo')
        )
    );
  }

  // React to list or carousel selection
  function itemSelected (app) {
    const param = app.getSelectedOption();
    console.log('USER SELECTED: ' + param);
    if (!param) {
      app.ask('You did not select any item from the list or carousel');
    } else if (param === SELECTION_KEY_ONE) {
      app.ask('You selected the first item in the list or carousel');
    } else if (param === SELECTION_KEY_GOOGLE_HOME) {
      app.ask('You selected the Google Home!');
    } else if (param === SELECTION_KEY_GOOGLE_PIXEL) {
      app.ask('You selected the Google Pixel!');
    } else if (param === SELECTION_KEY_GOOGLE_ALLO) {
      app.ask('You selected Google Allo!');
    } else {
      app.ask('You selected an unknown item from the list or carousel');
    }
  }

  // Recive a rich response from API.AI and modify it
  function cardBuilder (app) {
    app.ask(app.getIncomingRichResponse()
      .addBasicCard(app.buildBasicCard(`Actions on Google let you build for
       the Google Assistant. Reach users right when they need you. Users don’t
       need to pre-enable skills or install new apps.  \n  \nThis was written
       in the fulfillment webhook!`)
        .setSubtitle('Engage users through the Google Assistant')
        .setTitle('Actions on Google')
        .addButton('Developer Site', 'https://developers.google.com/actions/')
        .setImage('https://lh3.googleusercontent.com/Z7LtU6hhrhA-5iiO1foAfGB' +
          '75OsO2O7phVesY81gH0rgQFI79sjx9aRmraUnyDUF_p5_bnBdWcXaRxVm2D1Rub92' +
          'L6uxdLBl=s1376', 'Actions on Google')));
  }

  // Leave conversation with card
  function byeCard (app) {
    app.tell(app.buildRichResponse()
      .addSimpleResponse('Goodbye, World!')
      .addBasicCard(app.buildBasicCard('This is a goodbye card.')));
  }

  // Leave conversation with SimpleResponse
  function byeResponse (app) {
    app.tell({speech: 'Okay see you later',
      displayText: 'OK see you later!'});
  }

  // Leave conversation
  function normalBye (app) {
    app.tell('Okay see you later!');
  }