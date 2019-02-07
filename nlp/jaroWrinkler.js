var natural = require('natural');

module.exports = {
  "StringDistance": (input, body, cb) => {
    
    let highTotal = "";
    let higestMatchedIncident = "";
    let incidentDescription = null;
    let matchFlag = false;
    let sys_id = "";
    let response = {};
      body.result.forEach((element, index) => {
        if (natural.JaroWinklerDistance(input.desc, element.short_description) >= 0.90) {
          matchFlag = true;
          if (highTotal < natural.JaroWinklerDistance(input.desc, element.short_description)) {
            highTotal = natural.JaroWinklerDistance(input.desc, element.short_description);
            higestMatchedIncident = element.number;
            incidentDescription = element.short_description;
            sys_id = element.sys_id;
          }
          // console.log(element.number + ": " + element.short_description + " - with threshold: " + natural.JaroWinklerDistance("my mouse is absolutely not working at all", element.short_description));
        }
        if (body.result.length == index + 1) {
          // console.log(highTotal + ": " + higestMatchedIncident + ": " + incidentDescription);
          if (matchFlag) {
            response = {
              matched: true,
              result: {
                threshold: highTotal,
                incidentNumber: higestMatchedIncident,
                incidentDescription: incidentDescription,
                sys_id: sys_id
              }
            }
          } else {
            response = {
              matched: false,
              result: null
            }
          }
          cb(null, response);
        }
      });
      // console.log(body);
 
  }
}