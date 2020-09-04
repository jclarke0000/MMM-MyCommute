
/*********************************

  Magic Mirror Module: 
  MMM-MyCommute
  By Jeff Clarke

  Fork of mrx-work-traffic
  By Dominic Marx
  https://github.com/domsen123/mrx-work-traffic

  MIT Licensed
 
*********************************/

Module.register('MMM-MyCommute', {

  defaults: {
    apikey: '',
    origin: '65 Front St W, Toronto, ON M5J 1E6',
    startTime: '00:00',
    endTime: '23:59',
    hideDays: [],
    showSummary: true,
    colorCodeTravelTime: true,
    moderateTimeThreshold: 1.1,
    poorTimeThreshold: 1.3,
    nextTransitVehicleDepartureFormat: "[next at] h:mm a",
    travelTimeFormat: "m [min]",
    travelTimeFormatTrim: "left",
    pollFrequency: 10 * 60 * 1000, //every ten minutes, in milliseconds
    destinations: [
      {
        destination: '40 Bay St, Toronto, ON M5J 2X2',
        label: 'Air Canada Centre',
        mode: 'walking',
        time: null
      },
      {
        destination: '317 Dundas St W, Toronto, ON M5T 1G4',
        label: 'Art Gallery of Ontario',
        mode: 'transit',
        time: null
      },
      {
        destination: '55 Mill St, Toronto, ON M5A 3C4',
        label: 'Distillery',
        mode: 'bicycling',
        time: null
      },
      {
        destination: '6301 Silver Dart Dr, Mississauga, ON L5P 1B2',
        label: 'Pearson Airport',
        time: null
      }
    ]
  },

  // Define required scripts.
  getScripts: function() {
    return ["moment.js", this.file("node_modules/moment-duration-format/lib/moment-duration-format.js")];
  },
  
  // Define required styles.
  getStyles: function () {
    return ["MMM-MyCommute.css", "font-awesome.css"];
  },

  travelModes: [
    'driving',
    'walking',
    'bicycling',
    'transit'
  ],

  transitModes: [
    'bus',
    'subway',
    'train',
    'tram',
    'rail'
  ],


  avoidOptions: [
    'tolls',
    'highways',
    'ferries',
    'indoor'
  ],



  // Icons to use for each transportation mode
  symbols: {
    'driving':          'car',
    'walking':          'walk',
    'bicycling':        'bike',
    'transit':          'streetcar',
    'tram':             'streetcar',
    'bus':              'bus',
    'subway':           'subway',
    'train':            'train',
    'rail':             'train',
    'metro_rail':       'subway',
    'monorail':         'train',
    'heavy_rail':       'train',
    'commuter_train':   'train',
    'high_speed_train': 'train',
    'intercity_bus':    'bus',
    'trolleybus':       'streetcar',
    'share_taxi':       'taxi',
    'ferry':            'boat',
    'cable_car':        'gondola',
    'gondola_lift':     'gondola',
    'funicular':        'gondola',
    'other':            'streetcar'
  },  

  start: function() {

    Log.info('Starting module: ' + this.name);

    this.predictions = new Array();
    this.loading = true;
    this.inWindow = true;
    this.isHidden = false;

    //start data poll
    this.getData();
    var self = this;
    setInterval(function() {
      self.getData();
    }, this.config.pollFrequency);
      
  },

  /*
    function isInWindow()

    @param start
      STRING display start time in 24 hour format e.g.: 06:00

    @param end
      STRING display end time in 24 hour format e.g.: 10:00

    @param hideDays
      ARRAY of numbers representing days of the week during which
      this tested item shall not be displayed.  Sun = 0, Sat = 6
      e.g.: [3,4] to hide the module on Wed & Thurs

    returns TRUE if current time is within start and end AND
    today is not in the list of days to hide.

  */
  isInWindow: function(start, end, hideDays) {

    var now = moment();
    var startTimeSplit = start.split(":");
    var endTimeSplit = end.split(":");
    var startTime = moment().hour(startTimeSplit[0]).minute(startTimeSplit[1]);
    var endTime = moment().hour(endTimeSplit[0]).minute(endTimeSplit[1]);

    if ( now.isBefore(startTime) || now.isAfter(endTime) ) {
      return false;
    } else if ( hideDays.indexOf( now.day() ) != -1) {
      return false;
    }

    return true;
  },

  getData: function() {

    //only poll if in window
    if ( this.isInWindow( this.config.startTime, this.config.endTime, this.config.hideDays ) ) {
      //build URLs
      var destinations = new Array();
      for(var i = 0; i < this.config.destinations.length; i++) {

        var d = this.config.destinations[i];

        var destStartTime = d.startTime || '00:00';
        var destEndTime = d.endTime || '23:59';
        var destHideDays = d.hideDays || [];

        if ( this.isInWindow( destStartTime, destEndTime, destHideDays ) ) {
          var url = 'https://maps.googleapis.com/maps/api/directions/json' + this.getParams(d);
          destinations.push({ url:url, config: d});
          console.log(url);          
        }

      }
      this.inWindow = true;

      if (destinations.length > 0) {        
        this.sendSocketNotification("GOOGLE_TRAFFIC_GET", {destinations: destinations, instanceId: this.identifier});
      } else {
        this.hide(1000, {lockString: this.identifier});
        this.inWindow = false;
        this.isHidden = true;
      }

    } else {

      this.hide(1000, {lockString: this.identifier});
      this.inWindow = false;
      this.isHidden = true;
    }

  },

  getParams: function(dest) {

    var params = '?';
    params += 'origin=' + encodeURIComponent(dest.origin || this.config.origin);
    params += '&destination=' + encodeURIComponent(dest.destination);
    params += '&key=' + this.config.apikey;

    //travel mode
    var mode = 'driving';
    if (dest.mode && this.travelModes.indexOf(dest.mode) != -1) {
      mode = dest.mode;
    } 
    params += '&mode=' + mode;

    //transit mode if travelMode = 'transit'
    if (mode == 'transit' && dest.transitMode) {
      var tModes = dest.transitMode.split("|");
      var sanitizedTransitModes = '';
      for (var i = 0; i < tModes.length; i++) {
        if (this.transitModes.indexOf(tModes[i]) != -1) {
          sanitizedTransitModes += (sanitizedTransitModes == '' ? tModes[i] : "|" + tModes[i]);
        }
      }
      if (sanitizedTransitModes.length > 0) {
        params += '&transit_mode=' + sanitizedTransitModes;
      }
    } 
    if (dest.alternatives == true) {
      params += '&alternatives=true';
    }

    if (dest.waypoints) {
      var waypoints = dest.waypoints.split("|");
      for (var i = 0; i < waypoints.length; i++) {
        waypoints[i] = "via:" + encodeURIComponent(waypoints[i]);
      }
      params += '&waypoints=' + waypoints.join("|");
    } 

    //avoid
    if (dest.avoid) {
      var a = dest.avoid.split("|");
      var sanitizedAvoidOptions = '';
      for (var i = 0; i < a.length; i++) {
        if (this.avoidOptions.indexOf(a[i]) != -1) {
          sanitizedAvoidOptions += (sanitizedAvoidOptions == '' ? a[i] : "|" + a[i]);
        }
      }
      if (sanitizedAvoidOptions.length > 0) {
        params += '&avoid=' + sanitizedAvoidOptions;
      }

    }

    params += '&departure_time=now'; //needed for time based on traffic conditions

    return params;

  },  

  svgIconFactory: function(glyph) {

    var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttributeNS(null, "class", "transit-mode-icon");
    var use = document.createElementNS('http://www.w3.org/2000/svg', "use");
    use.setAttributeNS("http://www.w3.org/1999/xlink", "href", "modules/MMM-MyCommute/icon_sprite.svg#" + glyph);
    svg.appendChild(use);
    
    return(svg);
  },

  formatTime: function(time, timeInTraffic) {

    var timeEl = document.createElement("span");
    timeEl.classList.add("travel-time");
    if (timeInTraffic != null) {
      timeEl.innerHTML = moment.duration(Number(timeInTraffic), "seconds").format(this.config.travelTimeFormat, {trim: this.config.travelTimeFormatTrim});

      var variance = timeInTraffic / time;
      if (this.config.colorCodeTravelTime) {            
        if (variance > this.config.poorTimeThreshold) {
          timeEl.classList.add("status-poor");
        } else if (variance > this.config.moderateTimeThreshold) {
          timeEl.classList.add("status-moderate");
        } else {
          timeEl.classList.add("status-good");
        }
      }

    } else {
      timeEl.innerHTML = moment.duration(Number(time), "seconds").format(this.config.travelTimeFormat, {trim: this.config.travelTimeFormatTrim});
      timeEl.classList.add("status-good");
    }

    return timeEl;

  },

  getTransitIcon: function(dest, route) {

    var transitIcon;

    if (dest.transitMode) {
      var transitIcon = dest.transitMode.split("|")[0];
      if (this.symbols[transitIcon] != null) {
        transitIcon = this.symbols[transitIcon];
      } else {
        transitIcon = this.symbols[route.transitInfo[0].vehicle.toLowerCase()];
      }
    } else {
      transitIcon = this.symbols[route.transitInfo[0].vehicle.toLowerCase()];
    }

    return transitIcon;

  },

  buildTransitSummary: function(transitInfo, summaryContainer) {

    for (var i = 0; i < transitInfo.length; i++) {    

      var transitLeg = document.createElement("span");
        transitLeg.classList.add('transit-leg');
        transitLeg.appendChild(this.svgIconFactory(this.symbols[transitInfo[i].vehicle.toLowerCase()]));

      var routeNumber = document.createElement("span");
        routeNumber.innerHTML = transitInfo[i].routeLabel;

      if (transitInfo[i].arrivalTime) {
        routeNumber.innerHTML = routeNumber.innerHTML + " (" + moment(transitInfo[i].arrivalTime).format(this.config.nextTransitVehicleDepartureFormat) + ")";
      }

      transitLeg.appendChild(routeNumber);
      summaryContainer.appendChild(transitLeg);
    }

  },


  getDom: function() {

    var wrapper = document.createElement("div");
    
    if (this.loading) {
      var loading = document.createElement("div");
        loading.innerHTML = this.translate("LOADING");
        loading.className = "dimmed light small";
        wrapper.appendChild(loading);
      return wrapper
    }

    for (var i = 0; i < this.predictions.length; i++) {

      var p = this.predictions[i];

      var row = document.createElement("div");
      row.classList.add("row");

      var destination = document.createElement("span");
      destination.className = "destination-label bright";
      destination.innerHTML = p.config.label;
      row.appendChild(destination);

      var icon = document.createElement("span");
      icon.className = "transit-mode bright";
      var symbolIcon = 'car';
      if (this.config.destinations[i].color) {
        icon.setAttribute("style", "color:" + p.config.color);
      }

      if (p.config.mode && this.symbols[p.config.mode]) {
        symbolIcon = this.symbols[p.config.mode];
      }

      //different rendering for single route vs multiple
      if (p.error) {

        //no routes available.  display an error instead.
        var errorTxt = document.createElement("span");
        errorTxt.classList.add("route-error");
        errorTxt.innerHTML = "Error";
        row.appendChild(errorTxt);

      } else if (p.routes.length == 1 || !this.config.showSummary) {

        var r = p.routes[0];

        row.appendChild( this.formatTime(r.time, r.timeInTraffic) );

        //summary?
        if (this.config.showSummary) {
          var summary = document.createElement("div");
            summary.classList.add("route-summary");

          if (r.transitInfo) {

            symbolIcon = this.getTransitIcon(p.config,r);
            this.buildTransitSummary(r.transitInfo, summary); 

          } else {
            summary.innerHTML = r.summary;
          }
          row.appendChild(summary);
        }


      } else {

        row.classList.add("with-multiple-routes");

        for (var j = 0; j < p.routes.length; j++) {
          var routeSummaryOuter = document.createElement("div");
          routeSummaryOuter.classList.add("route-summary-outer");

          var r = p.routes[j];

          routeSummaryOuter.appendChild( this.formatTime(r.time, r.timeInTraffic) );

          var summary = document.createElement("div");
            summary.classList.add("route-summary");

          if (r.transitInfo) {
            symbolIcon = this.getTransitIcon(p.config,r);
            this.buildTransitSummary(r.transitInfo, summary); 

          } else {
            summary.innerHTML = r.summary;
          }
          routeSummaryOuter.appendChild(summary);
          row.appendChild(routeSummaryOuter);

        } 

      }




      

      var svg = this.svgIconFactory(symbolIcon);
      icon.appendChild(svg);
      row.appendChild(icon);
      
      

      wrapper.appendChild(row);
    }


    return wrapper;
  },
  
  socketNotificationReceived: function(notification, payload) {
    if ( notification === 'GOOGLE_TRAFFIC_RESPONSE' + this.identifier ) {

      this.predictions = payload;

      if (this.loading) {
        this.loading = false;
        if (this.isHidden) {
          this.updateDom();
          this.show(1000, {lockString: this.identifier});
        } else {
          this.updateDom(1000);
        }
      } else {
        this.updateDom();
        this.show(1000, {lockString: this.identifier});        
      }
      this.isHidden = false;
    }


  },

  notificationReceived: function(notification, payload, sender) {
    if ( notification == 'DOM_OBJECTS_CREATED' && !this.inWindow) {
      this.hide(0, {lockString: this.identifier});
      this.isHidden = true;
    }
  }

});
