// global variables at the top
var map;
var infoWindow;

// call setup when DOM loads
$(document).ready(setup);

// when the page loads...
function setup() {
  // show the map
  initMap();

  // start getting geolocation
  getMyLocation();

  // add event listener / call search4sq()
  // when user submits the search form
  $('#4sq-search').on('submit', search4sq);
}

// initialize the map with a hard-coded lat / lng
// while we wait for geolocation to finish
function initMap() {
  var mapDiv = document.getElementById('map');
  map = new google.maps.Map( mapDiv, {
    center: {
      lat: 31.2304,
      lng: 121.4737
    },
    zoom: 12
  });
}

// called by setup()
function getMyLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(gotPosition);
  } else {
    alert("your browser does not support geolocation ");
  }
}


// callback from getCurrentPosition;
function gotPosition(data) {
  console.log('got position', data);
  setMapPos(data);
}


/**
 *   now that we have the user's geolocation data...
 *   - re-center the map 
 *   - create a google.maps.Marker with the title 'My Location'
 *   - create a google.maps.InfoWindow to show info about the markers when you click on them
 */
function setMapPos(data) {

  // set map's center using the user's geolocation data
  map.setCenter({
    lat: data.coords.latitude,
    lng: data.coords.longitude
  });

  // create a marker, and use the geolocation data as its position.
  var marker = new google.maps.Marker({
    position: {
      lat: data.coords.latitude,
      lng: data.coords.longitude
    },
    // attach marker to our global variable "map" (the map we created)
    map: map,
    // give the marker a title which will be displayed in the InfoWindow below
    title: 'My Location'
  });


  // create a InfoWindow with no content. We will set the content when markers are clicked.
  infoWindow = new google.maps.InfoWindow({
    content: ''
  });

  // add event listener to the marker
  marker.addListener('click', markerClicked);
}

// event handler for marker 'click' events
function markerClicked() {
  // "this" refers to the marker that you clicked on.
  // We use this to change the InfoWindow's title and position when we open it.
  infoWindow.setContent(this.title)
  infoWindow.open(map, this);
}

/**
 *  Event handler when user submits the search form,
 *  where "e" is an event
 */
function search4sq(e) {

  // dont navigate away from the page (prevent the event's default action)
  e.preventDefault();

  // get value of the text input field
  var searchVal = $('#search').val();

  // get lat/lng position from map
  var lat = map.getCenter().lat();
  var lng = map.getCenter().lng();

  // create our custom URL
  // *clientID and clientSecret are variables that you provide*
  var url = 'https://api.foursquare.com/v2/venues/search' +
  '?client_id=' + clientID +
  ' &client_secret=' + clientSecret +
  '&v=20130815' +
  '&ll=' + lat + ',' + lng +
  '&query=' +searchVal;

  console.log(url);

  // Use jQuery's ajax function to
  // fetch data from the Foursquare API url
  // without leaving the page. 
  $.ajax(url, {
    success: gotPlaces,
    error: onError
  });
}

// AJAX error event handler
function onError(err) {
  console.error(err);
}

/**
 *  AJAX success event handler.
 *  
 *  "result" will be a JSON object
 *  with data from our Foursquare API query
 */
function gotPlaces(result) {
  console.log(result);

  // here's the data we were looking for: an array of venue objecs
  var places = result.response.venues;

  // loop thru the array of venue objects
  for (var i = 0; i < places.length; i++) {

    // find the data we need for each venue
    var venue = places[i];
    var lat = venue.location.lat;
    var lng = venue.location.lng;
    var title = venue.name;

    // add a marker for each venue
    addMarker(lat, lng, title);
  }
}

/**
 *  Helper function called by gotPlaces to add a marker
 *    - lat is a number for that marker's latitude
 *    - lng is a number for that marker's longitude
 *    - title is a title to display in the InfoWindow when that marker is clicked
 */
function addMarker(lat, lng, title) {

  // create a new marker at lat/lng
  var marker = new google.maps.Marker({
    position: {
        lat: lat,
        lng: lng
    },
    map: map,
    title: title
  });

  // call markerClicked when we click on the marker
  marker.addListener('click', markerClicked);
}

