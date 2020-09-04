# MMM-MyCommute
This a module for the [MagicMirror](https://github.com/MichMich/MagicMirror/tree/develop).

It shows your commute time using Google's Traffic API (requires an API Key from Google).

It is a fork of `mrx-work-traffic` by Dominic Marx.
https://github.com/domsen123/mrx-work-traffic

![Screen Shot](/../screenshots/MMM-MyCommute-screenshot.png?raw=true "Screen Shot")

# Installation
1. Navigate into your MagicMirror `modules` folder and execute<br>
`git clone https://github.com/jclarke0000/MMM-MyCommute.git`.
2. Enter the `MMM-MyCommute` directory and execute `npm install`.
3. Go to https://developers.google.com/maps/documentation/javascript/get-api-key and get an API key.

# NOTE To those updating from previous verions

You now configure the header in the standard way instead using the `headerText` and `showHeader` parameters. So if your config looked like this before:

```
    {
      module: 'MMM-MyCommute',
      position: 'top_left',
      classes: 'default everyone', 
      config: {
        showHeader: true,
        headerText: 'Traffic',
        ...
      }
    }
```
change it to this:
```
   {
      module: 'MMM-MyCommute',
      position: 'top_left',
      header: 'Traffic',
      classes: 'default everyone', 
      config: {
        ...
      }
    }
```
If you don’t want a header, then just omit it.

# Config
<table>
  <thead>
    <tr>
      <th>Option</th>
      <th>Descriptio</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>apikey</code></td>
      <td><strong>REQUIRED</strong> API Key from Google<br><br><strong>Type:</strong> <code>string</code></td>
    </tr>
    <tr>
      <td><code>origin</code></td>
      <td><strong>REQUIRED</strong> The starting point for your commute.  Usually this is your home address.<br><br><strong>Type:</strong> <code>string</code><br>This is as you would see it Google Maps.  Example:  <code>65 Front St W, Toronto, ON M5J 1E6</code></td>
    </tr>
    <tr>
      <td><code>startTime</code></td>
      <td>The start time of the window during which this module wil be visible.<br><br><strong>Type:</strong> <code>string</code><br>Must be in 24-hour time format.  Defaults to <code>00:00</code> (i.e.: midnight)</td>
    </tr>
    <tr>
      <td><code>endTime</code></td>
      <td>The end time of the window during which this module wil be visible.<br><br><strong>Type:</strong> <code>string</code><br>Must be in 24-hour time format.  Defaults to <code>23:59</code> (i.e.: one minute before midnight).</td>
    </tr>
    <tr>
      <td><code>hideDays</code></td>
      <td>A list of numbers representing days of the week to hide the module.<br><br><strong>Type:</strong> <code>array</code><br>Valid numbers are 0 through 6, 0 = Sunday, 6 = Saturday.<br>e.g.: <code>[0,6]</code> hides the module on weekends.</td>
    </tr>
    <tr>
      <td><code>showSummary</code></td>
      <td>Whether to show a brief summary of the route<br><br><strong>Type:</strong> <code>boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>colorCodeTravelTime</code></td>
      <td>Whether to colour-code the travel time red, yellow, or green based on traffic.<br><br><strong>Type:</strong> <code>boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>travelTimeFormat</code></td>
      <td>How the module should format your total travel time.<br><br><strong>Type:</strong> <code>string</code><br>Defaults to <code>m [min]</code> (e.g. 86 min).  Some other examples are <code>h[h] m[m]</code> (e.g.: 1h 26min), <code>h:mm</code> (e.g. 1:26).  This uses the <code>moment-duration-format</code> plugin's templating feature.  https://github.com/jsmreese/moment-duration-format#template</td>
    </tr>
    <tr>
      <td><code>travelTimeFormatTrim</code></td>
      <td>How to handle time tokens that have no value.  For example, if you configure <code>travelTimeFormat</code> as <code>"hh:mm"</code> but the actual travel time is less than an hour, by default only the minute portion of the duration will be rendered.  Set <code>travelTimeFormatTrim</code> to <code>false</code> to preserve the <code>hh:</code> portion of the format (e.g.: <code>00:21</code>).  Valid options are <code>"left"</code>, <code>"right"</code> (e.g.: <code>2:00</code> renders as <code>2</code>), or <code>false</code> (e.g.: do not trim).<br><br><strong>Type:</strong> <code>String</code> or <code>false</code><br>Defaults to <code>"left"</code>.</td>
    </tr>
    <tr>
      <td><code>moderateTimeThreshold</code></td>
      <td>The amount of variance between time in traffic vs absolute fastest time after which the time is coloured yellow<br><br><strong>Type:</strong> <code>float</code><br>Defaults to <code>1.1</code> (i.e.: 10% longer than fastest time)</td>
    </tr>
    <tr>
      <td><code>poorTimeThreshold</code></td>
      <td>The amount of variance between time in traffic vs absolute fastest time after which the time is coloured red<br><br><strong>Type:</strong> <code>float</code><br>Defaults to <code>1.3</code> (i.e.: 30% longer than fastest time)</td>
    </tr>
    <tr>
      <td><code>nextTransitVehicleDepartureFormat</code></td>
      <td>For any transit destinations where <code>showNextVehicleDeparture</code> is true, this dictates how to format the next arrival time.<br><br><strong>Type:</strong> <code>string</code><br>Defaults to <code>[next at] h:mm a</code>.</td>
    </tr>
    <tr>
      <td><code>pollFrequency</code></td>
      <td>How frequently, in milliseconds, to poll for traffic predictions.<br><strong>BE CAREFUL WITH THIS!</strong>  We're using Google's free API which has a maximum of 2400 requests per day.  Each entry in the destinations list requires its own request so if you set this to be too frequent, it's pretty easy to blow your request quota.<br><br><strong>Type:</strong> <code>number</code>.<br>Defaults to <code>10 * 60 * 1000</code> (i.e.: 600000ms, or every 10 minutes)</td>
    </tr>
    <tr>
      <td><code>destinations</code></td>
      <td>An array of destinations to which you would like to see commute times.<br><br><strong>Type:</strong> <code>array</code> of objects.<br>See below for destination options.</td>
    </tr>
  </tbody>
</table>

Each object in the `destinations` array can have the following parameters:

<table>
  <thead>
    <tr>
      <th>Option</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>origin</code></td>
      <td><strong>OPTIONAL</strong> Use a different origin, e.g. to show your commute back home<br><br><strong>Type:</strong> <code>string</code></td>
    </tr>
    <tr>
      <td><code>destination</code></td>
      <td><strong>REQUIRED</strong> The address of the destination<br><br><strong>Type:</strong> <code>string</code></td>
    </tr>
    <tr>
      <td><code>label</code></td>
      <td><strong>REQUIRED</strong> How you would like this displayed on your MagicMirror.<br><br><strong>Type:</strong> <code>string</code></td>
    </tr>
    <tr>
      <td><code>mode</code></td>
      <td>Transportation mode, one of the following: <code>driving</code>, <code>walking</code>, <code>bicycling</code>, <code>transit</code>.<br><br><strong>Type:</strong> <code>string</code><br>Defaults to <code>driving</code>.</td>
    </tr>
    <tr>
      <td><code>transitMode</code></td>
      <td>If <code>mode</code> = <code>transit</code> you can additionally specify one or more of the following: <code>bus</code>, <code>subway</code>, <code>train</code>, <code>tram</code>, or <code>rail</code>.<br><br><strong>Type:</strong> <code>string</code>.<br>Separate multiple entries with the <code>|</code> character (e.g.: <code>"transitMode" : "bus|subway|tram"</code>). Specifying <code>rail</code>indicates that the calculated route should prefer travel by train, tram, light rail, and subway.  Equivalenet to <code>train|tram|subway</code></td>
    </tr>
    <tr>
      <td><code>showNextVehicleDeparture</code></td>
      <td>If <code>mode</code> = <code>transit</code> the time of the next departure of the first vehicle on your route will be displayed in the route summary.  Only visible when <code>showSummary = true</code>.<br><br><strong>Type:</strong> <code>boolean</code>.</td>
    </tr>
    <tr>
      <td><code>waypoints</code></td>
      <td>If specified, it instructs Google to find the route that passes through the waypoints you specify.<br><br><strong>Type:</strong> <code>string</code>.<br>Separate multiple entries with the <code>|</code> character.  See https://developers.google.com/maps/documentation/directions/intro#Waypoints for details on how waypoints can be specified.<br><strong>NOTE:</strong> your waypoints will automatically be prefixed with <code>via:</code> so that they are not treated as stopovers.  This can cause Google to plan an erratic route.  if you find your time predictions are wildly overestimated, then try adjusting your waypoints.  Intersections where you would normally make a turn on this roite usually work well (e.g.: <code>Main St & Southwood Drive Toronto ON</code>).</td>
    </tr>
    <tr>
      <td><code>avoid</code></td>
      <td>If specified, will instruct the Google API to find a route that avoids one or more of the following: <code>tolls</code>,<code>highways</code>,<code>ferries</code>,<code>indoor</code>.<br><br><strong>Type:</strong> <code>string</code>.<br>Separate multiple entries with the <code>|</code> character (e.g.: <code>"avoid" : "highways|tolls"</code>).</td>
    </tr>
    <tr>
      <td><code>alternatives</code></td>
      <td>If specified, will instruct the Google API to provide times for alternate routes.  Must be used with <code>showSummary: true</code><br><br><strong>Type:</strong> <code>boolean</code></td>
    </tr>
    <tr>
      <td><code>color</code></td>
      <td>If specified, the colour for the icon in hexadecimal format (e.g.: <code>"#82BAE5"</code>)<br><br><strong>Type:</strong> <code>string</code><br>Defaults to white.</td>
    </tr>
    <tr>
      <td><code>startTime</code></td>
      <td>The start time of the window during which this route will be visible.<br><br><strong>Type:</strong> <code>string</code><br>Must be in 24-hour time format.  Defaults to <code>00:00</code> (i.e.: midnight)</td>
    </tr>
    <tr>
      <td><code>endTime</code></td>
      <td>The end time of the window during which this route will be visible.<br><br><strong>Type:</strong> <code>string</code><br>Must be in 24-hour time format.  Defaults to <code>23:59</code> (i.e.: one minute before midnight).</td>
    </tr>
    <tr>
      <td><code>hideDays</code></td>
      <td>A list of numbers representing days of the week to hide the route.<br><br><strong>Type:</strong> <code>array</code><br>Valid numbers are 0 through 6, 0 = Sunday, 6 = Saturday.<br>e.g.: <code>[0,6]</code> hides the destination on weekends.</td>
    </tr>

  </tbody>
</table>


Here is an example of an entry in `config.js`
```
{
  module: 'MMM-MyCommute',
  position: 'top_left',
  config: {
    apikey: 'API_KEY_FROM_GOOGLE',
    origin: '65 Front St W, Toronto, ON M5J 1E6',
    startTime: '00:00',
    endTime: '23:59',
    hideDays: [0,6],
    destinations: [
      {
        destination: '14 Duncan St Toronto, ON M5H 3G8',
        label: 'Air Canada Centre',
        mode: 'walking',
        color: '#82E5AA'
      },
      {
        destination: '317 Dundas St W, Toronto, ON M5T 1G4',
        label: 'Art Gallery of Ontario',
        mode: 'transit'
      },
      {
        origin: '317 Dundas St W, Toronto, ON M5T 1G4',
        destination: '65 Front St W, Toronto, ON M5J 1E6',
        label: 'Back home from the Art Gallery',
        mode: 'transit'
      },
      {
        destination: '55 Mill St, Toronto, ON M5A 3C4',
        label: 'Distillery District',
        mode: 'bicycling'
      },
      {
        destination: '6301 Silver Dart Dr, Mississauga, ON L5P 1B2',
        label: 'Pearson Airport',
        avoid: 'tolls'
      }
    ]
  }
}
```


## Dependencies
Installed during installation
- [request](https://www.npmjs.com/package/request)
- [moment](https://www.npmjs.com/package/moment)

## Special Thanks
- [Michael Teeuw](https://github.com/MichMich) for creating the awesome [MagicMirror2](https://github.com/MichMich/MagicMirror/tree/develop) project that made this module possible.
- [Dominic Marx](https://github.com/domsen123) for creating the original mrx-work-traffic that this module heavily borrows upon.
