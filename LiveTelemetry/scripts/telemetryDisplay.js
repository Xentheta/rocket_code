var socket = io("http://localhost:3000");

//#######################
//Variable Definitions###
//#######################

// GPS Variables
const default_lat = 40.7128;
const default_long = -74.0060;
let currentLatitude = null;
let currentLongitude = null;
let old_lat = null;
let old_long = null;
let currentGNSSalti = null;

// Altimeter Variables
let currentHumidity1 = null;
let currentTemp1 = null;
let currentPressure1 = null;
let currentAltitude1 = null;

let currentHumidity2 = null;
let currentTemp2 = null;
let currentPressure2 = null;
let currentAltitude2 = null;

// Accelerometer Variables
let currentAccelX = null;
let currentAccelY = null;
let currentAccelZ = null;

// IMU Variables
let currentGyroX = null;
let currentGyroY = null;
let currentGyroZ = null;

// Calculated Variables
let currentfirstLat = null, currentlastLat = null;
let currentfirstLon = null, currentlastLon = null;
let currentApogee = null;
let currentmaxAccel = null;
let currentminAlt = null;
let currentmaxHum = null, currentminHum = null; 
let currentmaxTemp = null, currentminTemp = null; 
let currentmaxPress = null, currentminPress = null; 

// Frontend
let map;
let marker;

//Create new map
function initMap() {
	map = new google.maps.Map(document.getElementById("map"), {

		center: { lat: default_lat, lng: default_long }, 
    zoom: 15,
		mapId: "AIzaSyD399tkU7JKpLlu7mOl8fijGcQ-FEHO6hs",
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

//Get telemetry from dataStream.js

// GPS Data
socket.on("latitude", function (latitude) {
  currentLatitude = parseFloat(latitude);
  document.getElementById("latitude").textContent = currentLatitude;

  if (old_lat !== currentLatitude) {
    changeLocation(currentLatitude, currentLongitude || old_long);
    old_lat = currentLatitude;
  }
});
socket.on("firstLat", function (firstLat) {
  currentfirstLat = parseFloat(firstLat);
  document.getElementById("firstLat").textContent = currentfirstLat;

});
socket.on("lastLat", function (lastLat) {
  currentfirstLat = parseFloat(lastLat);
  document.getElementById("lastLat").textContent = currentlastLat;

});
socket.on("longitude", function (longitude) {
  currentLongitude = parseFloat(longitude);
  document.getElementById("longitude").textContent = currentLongitude;

  if (old_long !== currentLongitude) {
    changeLocation(currentLatitude || old_lat, currentLongitude);
    old_long = currentLongitude;
  }
});
socket.on("firstLon", function (firstLon) {
  currentfirstLat = parseFloat(firstLon);
  document.getElementById("firstLon").textContent = currentfirstLon;

});
socket.on("lastLon", function (lastLon) {
  currentfirstLat = parseFloat(lastLon);
  document.getElementById("lastLon").textContent = currentlastLon;

});
socket.on("altiGNSS", function (altiGNSS) {
  currentGNSSalti = parseFloat(altiGNSS);
  document.getElementById("lastAlti").textContent = currentGNSSalti;
});

// Altimeter1 Data
socket.on("humidity1", function (humidity1) {
  currentHumidity1 = parseFloat(humidity1);
  document.getElementById("humidity1").textContent = currentHumidity1;
  
});

socket.on("temperature1", function (temperature1) {
  currentTemp1 = parseFloat(temperature1);
  document.getElementById("temperature1").textContent = currentTemp1;

});

socket.on("pressure1", function (pressure1) {
  currentPressure1 = parseFloat(pressure1);
  document.getElementById("pressure1").textContent = currentPressure1;

}); 

socket.on("altitude1", function (altitude1) {
  currentAltitude1 = parseFloat(altitude1);
  document.getElementById("altitude1").textContent = currentAltitude1;

}); 

// Altimeter2 Data
socket.on("humidity2", function (humidity2) {
  currentHumidity2 = parseFloat(humidity2);
  document.getElementById("humidity2").textContent = currentHumidity2;
  
});

socket.on("temperature2", function (temperature2) {
  currentTemp2 = parseFloat(temperature2);
  document.getElementById("temperature2").textContent = currentTemp2;

});

socket.on("pressure2", function (pressure2) {
  currentPressure2 = parseFloat(pressure2);
  document.getElementById("pressure2").textContent = currentPressure2;

}); 

socket.on("altitude2", function (altitude2) {
  currentAltitude2 = parseFloat(altitude2);
  document.getElementById("altitude2").textContent = currentAltitude2;

}); 

// Accelerometer Data
socket.on("accelX", function (accelerationX) {
  currentAccelX = parseFloat(accelerationX);
  document.getElementById("accelX").textContent = currentAccelX;
});
socket.on("accelY", function (accelerationY) {
  currentAccelY = parseFloat(accelerationY);
  document.getElementById("accelY").textContent = currentAccelY;
});
socket.on("accelZ", function (accelerationZ) {
  currentAccelZ = parseFloat(accelerationZ);
  document.getElementById("accelZ").textContent = currentAccelZ;
  
});
socket.on("totalAccel", function (totalAccel) {
  currentTotalAcc = parseFloat(totalAccel);
  document.getElementById("totalAccel").textContent = currentTotalAcc;
});

// IMU Data
socket.on("gyroX", function (gyroX) {
  currentGyroX = parseFloat(gyroX);
  document.getElementById("gyroX").textContent = currentGyroX;
});
socket.on("gyroY", function (gyroY) {
  currentGyroY = parseFloat(gyroY);
  document.getElementById("gyroY").textContent = currentGyroY;
});
socket.on("gyroZ", function (gyroZ) {
  currentGyroZ = parseFloat(gyroZ);
  document.getElementById("gyroZ").textContent = currentGyroZ;
});

// Calculated Data

// Maxes
socket.on("apogee", function (apogee) {
  currentApogee = parseFloat(apogee);
  document.getElementById("apogee").textContent = currentApogee;
});
socket.on("maxAccel", function (maxAccel) {
  currentmaxAccel = parseFloat(maxAccel);
  document.getElementById("maxAccel").textContent = currentmaxAccel;
});
socket.on("maxHum", function (maxHum) {
  currentmaxHum = parseFloat(maxHum);
  document.getElementById("maxHum").textContent = currentmaxHum;
});
socket.on("maxTemp", function (maxTemp) {
  currentmaxTemp = parseFloat(maxTemp);
  document.getElementById("maxTemp").textContent = currentmaxTemp;
});
socket.on("maxPress", function (maxPress) {
  currentmaxHumid = parseFloat(maxPress);
  document.getElementById("maxPress").textContent = currentmaxPress;
});

// Mins
socket.on("minAlt", function (minAlt) {
  currentminAlt = parseFloat(minAlt);
  document.getElementById("minAlt").textContent = currentminAlt;
});
socket.on("minHum", function (minHum) {
  currentminHum = parseFloat(minHum);
  document.getElementById("minHum").textContent = currentminHum;
});
socket.on("minTemp", function (minTemp) {
  currentminTemp = parseFloat(minTemp);
  document.getElementById("minTemp").textContent = currentminTemp;
});
socket.on("minPress", function (minPress) {
  currentminHumid = parseFloat(minPress);
  document.getElementById("minPress").textContent = currentminPress;
});

//calculate total acceleration 

    // Handle socket events
    socket.on("connect", () => {
		console.log("Connected to the server");
    });

    socket.on("disconnect", () => {
		console.log("Disconnected from the server");
    });
