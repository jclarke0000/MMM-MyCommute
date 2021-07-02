/* Magic Mirror
 * Module: mrx-work-traffic
 *
 * By Dominic Marx
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var fetch = require('node-fetch');
var moment = require('moment');
 
module.exports = NodeHelper.create({

  start: function() {
    console.log("====================== Starting node_helper for module [" + this.name + "]");
  },
  
  
  // subclass socketNotificationReceived
  socketNotificationReceived: function(notification, payload){
    if (notification === 'GOOGLE_TRAFFIC_GET') {

      //first data opull after new config
    (async () => {await this.getPredictions(payload);})();
	}
  },
	
	
	getPredictions: async function(payload) {

    var returned = 0;
    var predictions = new Array();
//	console.log("MM-MyCommute-DEBUG PAYLOAD GET PREDECTIONS: "+ JSON.stringify(payload,undefined,2));

	for (let index = 0 ; index < payload.destinations.length ; index++) {
      var dest = payload.destinations[index] ;
	  try {
		var body = await fetch(dest.url);
		var data = await body.json() ;
		
//		console.log("MM-MyCommute-DEBUG ("+ index + "): "+ JSON.stringify(data,undefined,2));
				
		var prediction = new Object({
			config: dest.config
		});

        if (data.error_message) {
            console.log("MMM-MyCommute: " + data.error_message);
            prediction.error = true;
        } else {
 
            var routeList = new Array();
            for (var i = 0; i < data.routes.length; i++) {
              var r = data.routes[i];
              var routeObj = new Object({
                summary: r.summary,
                time: r.legs[0].duration.value
              });

              if (r.legs[0].duration_in_traffic) {
                routeObj.timeInTraffic = r.legs[0].duration_in_traffic.value;
              }
              if (dest.config.mode && dest.config.mode == 'transit') {
                var transitInfo = new Array();
                var gotFirstTransitLeg = false;
                for (var j = 0; j < r.legs[0].steps.length; j++) {
                  var s = r.legs[0].steps[j];

                  if (s.transit_details) {
                    var arrivalTime = '';
                    if (!gotFirstTransitLeg && dest.config.showNextVehicleDeparture) {
                      gotFirstTransitLeg = true;
                      // arrivalTime = ' <span class="transit-arrival-time">(next at ' + s.transit_details.departure_time.text + ')</span>';
                      arrivalTime = moment(s.transit_details.departure_time.value * 1000);
                    }
                    transitInfo.push({routeLabel: s.transit_details.line.short_name ? s.transit_details.line.short_name : s.transit_details.line.name, vehicle: s.transit_details.line.vehicle.type, arrivalTime: arrivalTime});
                  }
                  routeObj.transitInfo = transitInfo;
                }
              }
              routeList.push(routeObj);
            }
            prediction.routes = routeList;
            
          }

        } catch(error) {
          console.log( "Error getting traffic prediction: " + error );
          prediction.error = true;

        };
		predictions[index] = prediction;
	};
        
    this.sendSocketNotification('GOOGLE_TRAFFIC_RESPONSE' + payload.instanceId, predictions);

  }
  
  
});