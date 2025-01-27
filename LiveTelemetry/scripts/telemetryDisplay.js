

var socket = io("http://localhost:3000");

//Variable Definitions
let map;
let marker; 
const default_lat = 40.7128;
const default_long = -74.0060;
let currentLatitude = null;
let currentLongitude = null;
let old_lat = null;
let old_long = null;

//Create new map
function initMap() {
	map = new google.maps.Map(document.getElementById("map"), {

		center: { lat: default_lat, lng: default_long }, 
    zoom: 15,
		mapId: "4f4eeedcd0c2a64d",
    disableDefaultUI: true,
	});

 	marker = new google.maps.marker.AdvancedMarkerElement({

    map: map,
    position: { lat: default_lat, lng: default_long },

	});
}

//Dynamically change map center and marker location
function changeLocation(newLat, newLng) {
  if (newLat != null && newLng != null) {
    const newCenter = { lat: newLat, lng: newLng };
    map.setCenter(newCenter);
    marker.position = newCenter; 
  }
}

//Get latitude and longitude telemetry from dataStream.js
socket.on("latitude", function (latitude) {
  currentLatitude = parseFloat(latitude);
  document.getElementById("latitude").textContent = currentLatitude;

  if (old_lat !== currentLatitude) {
    changeLocation(currentLatitude, currentLongitude || old_long);
    old_lat = currentLatitude;
  }
});

socket.on("longitude", function (longitude) {
  currentLongitude = parseFloat(longitude);
  document.getElementById("longitude").textContent = currentLongitude;

  if (old_long !== currentLongitude) {
    changeLocation(currentLatitude || old_lat, currentLongitude);
    old_long = currentLongitude;
  }
});

    // Handle socket events
    socket.on("connect", () => {
		console.log("Connected to the server");
    });

    socket.on("disconnect", () => {
		console.log("Disconnected from the server");
    });
