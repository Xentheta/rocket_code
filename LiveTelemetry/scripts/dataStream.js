const { SerialPort } = require("serialport");  // Import SerialPort correctly
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs");
const path = require("path");

// CSV File setup
const csvFilePath = path.join(__dirname, "sensor_data.csv");

const csvHeaders = [
  "timestamp",
  "latitude", "longitude", "altitudeGNSS",
  "humidity1", "temperature1", "pressure1", "altitude1",
  "humidity2", "temperature2", "pressure2", "altitude2",
  "accelX", "accelY", "accelZ", "totalAccel",
  "gyroX", "gyroY", "gyroZ"
];

if (!fs.existsSync(csvFilePath)) {
  fs.writeFileSync(csvFilePath, csvHeaders.join(",") + "\n", "utf8");
}

// Configure and open the serial port
const port = new SerialPort({
  path: "COM9",  // Replace with your serial port path
  baudRate: 230400,
  dataBits: 8,
  parity: "none",
  stopBits: 2,
  flowControl: false,
});


// Handle errors with the serial port
port.on("error", (err) => {
  console.error("Error with serial port:", err.message);
});

// Log when the port is open
port.on("open", () => {
  console.log("Serial port opened successfully");
});

// Create the HTTP server
const app = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("<h1>Socket.io and SerialPort Server</h1>");
});

// Set up socket.io for real-time communication
const io = socketIo(app, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"]
  }
}); 


if (!fs.existsSync(csvFilePath)) {
  fs.writeFileSync(csvFilePath, csvHeaders.join(",") + "\n", "utf8");
}


//###################################
// Variables to store sensor readings
//###################################

// GPS variables
let latitude = null, longitude = null;
let oldLat = null, oldLon = null;
let altitudeGNSS = null, oldAltG = null;

// Altimeter variables
let humidity1 = null , temperature1 = null, pressure1 = null, altitude1 = null;
let oldHmd1 = null, oldTmp1 = null, oldPrs1 = null, oldAlt1 = null;

let humidity2 = null, temperature2 = null, pressure2 = null, altitude2 = null;
let oldHmd2 = null, oldTmp2 = null, oldPrs2 = null, oldAlt2 = null;

// Accelerometer variables
let accelerationX = null, accelerationY = null, accelerationZ = null;
let oldAccX = null, oldAccY = null, oldAccZ = null;
let totalAccel = null;
let oldtotalAcc = null;

// IMU variables
let gyroX = null, gyroY = null, gyroZ = null;
let oldgyroX = null, oldgyroY = null, oldgyroZ = null;

// Calculated variables
let maxAlt1 = null, maxAlt2 = null, apogee = null;
let maxAccel = null;
let maxHum1 = null, maxTemp1 = null, maxPress1 = null; 
let maxHum2 = null, maxTemp2 = null, maxPress2 = null; 
let minHum1 = null, minTemp1 = null, minPress1 = null, minAlt1 = null; 
let minHum2 = null, minTemp2 = null, minPress2 = null, minAlt2 = null; 
let compmaxHum = null, compmaxTemp = null, compmaxPress = null;
let compminHum = null, compminTemp = null, compminPress = null, compminAlt = null;
let firstLat = null, firstLon = null;

let MCUstatus = null;
let missionStatus = null;

// Mass sensor status check
let gnssStat = false, alti1stat = false, alti2stat = false, accStat = false, IMUstat = true;

// Function for handling signed values

function signedHex(hex, byteLength) {
  const val = parseInt(hex, 16);
  const max = Math.pow(2, byteLength * 8);
  const limit = max / 2;
  return (val >= limit) ? val - max : val;
}

// CSV handling

function logSensorData() {
  const now = new Date().toISOString();
  const row = [
    now,
    latitude, longitude, altitudeGNSS,
    humidity1, temperature1, pressure1, altitude1,
    humidity2, temperature2, pressure2, altitude2,
    accelerationX, accelerationY, accelerationZ, totalAccel,
    gyroX, gyroY, gyroZ
  ];

  const safeRow = row.map(val => (val === null || val === undefined) ? "" : val);
  fs.appendFile(csvFilePath, safeRow.join(",") + "\n", (err) => {
    if (err) console.error("CSV Write Error:", err);
  });
}

io.on("connection", (socket) => {
  console.log("Client connected to socket.io");
  port.on("data", (data) => {

    let hexData = (data.toString('hex')).toUpperCase();
  
    console.log(hexData);

      // Check if the data contains any sensor value identifiers and emit to client
    // Latitude and longitude identifiers
    const LatPrefix = "4C61743A";
    const LonPrefix = "4C6F6E3A";
    const altiGPrefix = "416C74473A";

    // Altimeter 1 identifiers
    const humid1Prefix = "48756D313A"; 
    const temp1Prefix = "546D70313A";
    const press1Prefix = "507273313A";
    const alti1Prefix = "416C74313A";

    // Altimeter 2 identifiers
    const humid2Prefix = "48756D323A"; 
    const temp2Prefix = "546D70323A";
    const press2Prefix = "507273323A";
    const alti2Prefix = "416C74323A";

    // Accelerometer prefixes
    const accelXPrefix = "416363583A";
    const accelYPrefix = "416363593A";
    const accelZPrefix = "4163635A3A";

    // Gyroscope prefixes
    const gyroXPrefix = "726F74583A";
    const gyroYPrefix = "726F74593A";
    const gyroZPrefix = "726F745A3A";

    // Send status update
    if ((hexData !== null)) {
      MCUstatus = "connected";
      missionStatus = "issue";

      socket.emit("MCUstatus", MCUstatus);
      socket.emit("missionStatus", missionStatus);
    }
    if (hexData.startsWith(LatPrefix)) {
      const rawLat = hexData.slice(LatPrefix.length, LatPrefix.length + 8);
      const lat = signedHex(rawLat, 4) / 10000000;

      if (!isNaN(lat)) {
        console.log("Latitude received:", lat);
        latitude = lat;
      } else {
        console.log("Invalid latitude data:", hexData.toString());
      }
    } 
    else if (hexData.startsWith(LonPrefix)) {
      const rawLon = hexData.slice(LonPrefix.length, LonPrefix.length + 8);
      const lon = signedHex(rawLon, 4) / 10000000;

      if (!isNaN(lon)) {
        console.log("Longitude received:", lon);
        longitude = lon;
      } else {
        console.log("Invalid longitude data:", hexData.toString());
      }
    } 
    else if (hexData.startsWith(altiGPrefix)) {
      const rawAltG = hexData.slice(altiGPrefix.length, altiGPrefix.length + 8);
      const altG = signedHex(rawAltG, 4) / 10000000;

      if (!isNaN(altG)) {
        console.log("GNSS altitude received:", altG);
        longitude = altG;
      } else {
        console.log("Invalid GNSS altitude data:", hexData.toString());
      }
    } 
    ////////////// Altimeter 1 /////////////

    // Humidity
    else if (hexData.startsWith(humid1Prefix)) {
      const humid1 = parseInt(hexData.slice(humid1Prefix.length), 16) / 1000;
      
      if (!isNaN(humid1)) {
        console.log("Humidity1 received:", humid1);
        humidity1 = humid1;
      } else {
        console.log("Invalid humidity1 data:", hexData.toString());
      }
    } 
    // Temperature
    else if (hexData.startsWith(temp1Prefix)) {
      const temp1 = parseInt(hexData.slice(temp1Prefix.length), 16) / 1000;
      
      if (!isNaN(temp1)) {
        console.log("Temperature1 received:", temp1);
        temperature1 = temp1;
      } else {
        console.log("Invalid temperature1 data:", hexData.toString());
      }
    }
    // Pressure
    else if (hexData.startsWith(press1Prefix)) {
      const press1 = parseInt(hexData.slice(press1Prefix.length), 16) / 1000;
      
      if (!isNaN(press1)) {
        console.log("Pressure1 received:", press1);
        pressure1 = press1;
      } else {
        console.log("Invalid pressure1 data:", hexData.toString());
      }
    }
    // Altitude
    else if (hexData.startsWith(alti1Prefix)) {
      const alti1 = parseInt(hexData.slice(alti1Prefix.length), 16)/ 1000;
      
      if (!isNaN(alti1)) {
        console.log("Altitude1 received:", alti1);
        altitude1 = alti1;
      } else {
        console.log("Invalid altitude1 data:", hexData.toString());
      }
    }

    /////////// Altimeter 2 ////////////

    // Humidity
    else if (hexData.startsWith(humid2Prefix)) {
      const humid2 = parseInt(hexData.slice(humid2Prefix.length), 16) / 1000;
      
      if (!isNaN(humid2)) {
        console.log("Humidity2 received:", humid2);
        humidity2 = humid2;
      } else {
        console.log("Invalid humidity2 data:", hexData.toString());
      }
    } 
    // Temperature
    else if (hexData.startsWith(temp2Prefix)) {
      const temp2 = parseInt(hexData.slice(temp2Prefix.length), 16) / 1000;
      
      if (!isNaN(temp2)) {
        console.log("Temperature2 received:", temp2);
        temperature2 = temp2;
      } else {
        console.log("Invalid temperature2 data:", hexData.toString());
      }
    }
    // Pressure
    else if (hexData.startsWith(press2Prefix)) {
      const press2 = parseInt(hexData.slice(press2Prefix.length), 16) / 1000;
      
      if (!isNaN(press2)) {
        console.log("Pressure2 received:", press2);
        pressure2 = press2;
      } else {
        console.log("Invalid pressure2 data:", hexData.toString());
      }
    }
    // Altitude
    else if (hexData.startsWith(alti2Prefix)) {
      const alti2 = parseInt(hexData.slice(alti2Prefix.length), 16) / 1000;
      
      if (!isNaN(alti2)) {
        console.log("Altitude2 received:", alti2);
        altitude2 = alti2;
      } else {
        console.log("Invalid altitude2 data:", hexData.toString());
      }
    }

    // Accelerometer data
    else if (hexData.startsWith(accelXPrefix)) {
      const rawAccX = hexData.slice(accelXPrefix.length, accelXPrefix.length + 4);
      const accelX = signedHex(rawAccX, 2) / 1000;

      if (!isNaN(accelX)) {
        console.log("AccelerationX received:", accelX);
        accelerationX = accelX;
      } else {
        console.log("Invalid accelerationX data:", hexData.toString());
      }
    }
    else if (hexData.startsWith(accelYPrefix)) {
      const rawAccY = hexData.slice(accelYPrefix.length, accelYPrefix.length + 4);
      const accelY = signedHex(rawAccY, 2) / 1000;

      if (!isNaN(accelY)) {
        console.log("AccelerationY received:", accelY);
        accelerationY = accelY;
      } else {
        console.log("Invalid accelerationY data:", hexData.toString());
      }
    }
    else if (hexData.startsWith(accelZPrefix)) {
      const rawAccZ = hexData.slice(accelZPrefix.length, accelZPrefix.length + 4);
      const accelZ = signedHex(rawAccZ, 2) / 1000;

      if (!isNaN(accelZ)) {
        console.log("AccelerationZ received:", accelZ);
        accelerationZ = accelZ;
      } else {
        console.log("Invalid accelerationZ data:", hexData.toString());
      }
    } 

    // IMU Data
    else if (hexData.startsWith(gyroXPrefix)) {
      const rawGyroX = hexData.slice(gyroXPrefix.length, gyroXPrefix.length + 4);
      const imuX = signedHex(rawGyroX, 2) / 1000;

      if (!isNaN(imuX)) {
        console.log("gyroscopeX received:", imuX);
        gyroX = imuX;
      } else {
        console.log("Invalid gyroscopeX data:", hexData.toString());
      }
    }
    else if (hexData.startsWith(gyroYPrefix)) {
      const rawGyroY = hexData.slice(gyroYPrefix.length, gyroYPrefix.length + 4);
      const imuY = signedHex(rawGyroY, 2) / 1000;

      if (!isNaN(imuY)) {
        console.log("gyroscopeY received:", imuY);
        gyroY = imuY;
      } else {
        console.log("Invalid gyroscopeY data:", hexData.toString());
      }
    }
    else if (hexData.startsWith(gyroZPrefix)) {
      const rawGyroZ = hexData.slice(gyroZPrefix.length, gyroZPrefix.length + 4);
      const imuZ = signedHex(rawGyroZ, 2) / 1000;

      if (!isNaN(imuZ)) {
        console.log("gyroscopeZ received:", imuZ);
        gyroZ = imuZ;
      } else {
        console.log("Invalid gyroscopeZ data:", hexData.toString());
      }
    } 

    // If both latitude and longitude are available, emit them to the client
    if ((latitude !== null) && (oldLat == null)) {
      console.log("Sending latitude to client.");
      socket.emit("latitude", latitude);

      // Store old latitude
      oldLat = latitude;
      firstLat = latitude;
      console.log("Sending starting latitude to client.");
      socket.emit("firstLat", firstLat); 
      console.log("Sending last latitude to client.");
      socket.emit("lastLat", oldLat); 
    } else if ((latitude !== null) && ((latitude <= (oldLat + 0.03)) && (latitude >= (oldLat - 0.03)))) {
      console.log("Sending latitude to client.");
      socket.emit("latitude", latitude);

      oldLat = latitude;
      console.log("Sending last latitude to client.");
      socket.emit("lastLat", oldLat); 
    }
    if ((longitude !== null) && (oldLon == null)) {
      console.log("Sending longitude to client.");
      socket.emit("longitude", longitude);

      // Store old longitude
      oldLon = longitude;
      firstLon = longitude;
      console.log("Sending starting longitude to client.");
      socket.emit("firstLon", firstLon);
      console.log("Sending last longitude to client.");
      socket.emit("lastLon", oldLon); 
    } else if ((longitude !== null) && ((longitude <= (oldLon + 0.03)) && (longitude >= (oldLon - 0.03)))) {
      console.log("Sending longitude to client.");
      socket.emit("longitude", longitude);

      oldLon = longitude;
      console.log("Sending last longitude to client.");
      socket.emit("lastLon", oldLon); 
    }
    if ((altitudeGNSS !== null) && (oldAltG == null)) {
      console.log("Sending GNSS altitude to client.");
      socket.emit("altiGNSS", altitudeGNSS);

      oldAltG = altitudeGNSS;
    } else if ((altitudeGNSS !== null) && ((altitudeGNSS <= (oldAltG + 10000)) && (altitudeGNSS >= (oldAltG - 10000)))) {
      console.log("Sending GNSS altitude to client.");
      socket.emit("altiGNSS", altitudeGNSS);

      oldAltG = altitudeGNSS;     
    }
    if ((oldLat !== null) && (oldLon !== null)) {
      gnssStat = true;
    }

    // If altimeter 1 data is available, emit it to the client
    if ((humidity1 !== null) && (oldHmd1 == null)) {
      console.log("Sending humidity1 to client.");
      socket.emit("humidity1", humidity1);

      // Store old humidity1
      oldHmd1 = humidity1;
      minHum1 = humidity1;
    } else if ((humidity1 !== null) && ((humidity1 <= (oldHmd1 + 100)) && (humidity1 >= (oldHmd1 - 100)))) {
      console.log("Sending humidity1 to client.");
      socket.emit("humidity1", humidity1);

      if (humidity1 > oldHmd1) {
        maxHum1 = humidity1;
      }
      oldHmd1 = humidity1;
    }
    if ((temperature1 !== null) && (oldTmp1 == null)) {
      console.log("Sending temperature1 to client.");
      socket.emit("temperature1", temperature1);

      // Store old temperature1
      oldTmp1 = temperature1;
      maxTemp1 = temperature1; 
    } else if ((temperature1 !== null) && ((temperature1 <= (oldTmp1 + 500)) && (temperature1 >= (oldTmp1 - 500)))) {
      console.log("Sending temperature1 to client.");
      socket.emit("temperature1", temperature1);
      
      if (temperature1 < oldTmp1) {
        minTemp1 = temperature1;
      }
      oldTmp1 = temperature1;
    }
    if ((pressure1 !== null) && (oldPrs1 == null)) {
      console.log("Sending pressure1 to client.");
      socket.emit("pressure1", pressure1); 

      // Store old pressure1
      oldPrs1 = pressure1;
      maxPress1 = pressure1;

    } else if ((pressure1 !== null) && ((pressure1 <= (oldPrs1 + 20000)) && (pressure1 >= (oldPrs1 - 20000)))) {
      console.log("Sending pressure1 to client.");
      socket.emit("pressure1", pressure1); 

      if (pressure1 < oldPrs1) {
        minPress1 = pressure1;
      }
      oldPrs1 = pressure1;
    }
    if ((altitude1 !== null) && (oldAlt1 == null)) {
      console.log("Sending altitude1 to client.");
      socket.emit("altitude1", altitude1);

      // Store old altitude1
      oldAlt1 = altitude1;
      minAlt1 = altitude1;
    } else if ((altitude1 !== null) && ((altitude1 <= (oldAlt1 + 10000)) && (altitude1 >= (oldAlt1 - 10000)))) {
      console.log("Sending altitude1 to client.");
      socket.emit("altitude1", altitude1);
      
      if ((altitude1 > oldAlt1) && (apogee == null)) {
        maxAlt1 = altitude1 - minAlt1;
      } 
      else if (altitude1 > apogee) {
        maxAlt1 = altitude1 - minAlt1;
      }
      oldAlt1 = altitude1;
    }
    if ((oldHmd1 !== null) && (oldTmp1 !== null) && (oldPrs1 !== null) && (oldAlt1 !== null)) {
      alti1stat = true;
    }

    // If altimeter 2 data is available, emit it to the client
    if ((humidity2 !== null) && (oldHmd2 == null)) {
      console.log("Sending humidity2 to client.");
      socket.emit("humidity2", humidity2);

      // Store old humidity2
      oldHmd2 = humidity2;
      minHum2 = humidity2;
    } else if ((humidity2 !== null) && ((humidity2 <= (oldHmd2 + 100)) && (humidity2 >= (oldHmd2 - 100)))) {
      console.log("Sending humidity2 to client.");
      socket.emit("humidity2", humidity2);
      
      if (humidity2 > oldHmd2) {
        maxHum2 = humidity2;
      }
      oldHmd2 = humidity2;
    }
    if ((temperature2 !== null) && (oldTmp2 == null)) {
      console.log("Sending temperature2 to client.");
      socket.emit("temperature2", temperature2);

      // Store old temperature2
      oldTmp2 = temperature2;
      maxTemp2 = temperature2; 
    } else if ((temperature2 !== null) && ((temperature2 <= (oldTmp2 + 500)) && (temperature2 >= (oldTmp2 - 500)))) {
      console.log("Sending temperature2 to client.");
      socket.emit("temperature2", temperature2);

      if (temperature2 < oldTmp2) {
        minTemp2 = temperature2;
      }
      oldTmp2 = temperature2;
    }
    if ((pressure2 !== null) && (oldPrs2 == null)) {
      console.log("Sending pressure2 to client.");
      socket.emit("pressure2", pressure2); 

      // Store old pressure2
      oldPrs2 = pressure2;
      maxPress2 = pressure2; 
    } else if ((pressure2 !== null) && ((pressure2 <= (oldPrs2 + 20000)) && (pressure2 >= (oldPrs2 - 20000)))) {
      console.log("Sending pressure2 to client.");
      socket.emit("pressure2", pressure2); 

      if (pressure2 < oldPrs2) {
        minPress2 = pressure2;
      }
      oldPrs2 = pressure2;
    }
    if ((altitude2 !== null) && (oldAlt2 == null)) {
      console.log("Sending altitude2 to client.");
      socket.emit("altitude2", altitude2);

      // Store old altitude2
      oldAlt2 = altitude2;
      minAlt2 = altitude2; 
    } else if ((altitude2 !== null) && ((altitude2 <= (oldAlt2 + 10000)) && (altitude2 >= (oldAlt2 - 10000)))) {
      console.log("Sending altitude2 to client.");
      socket.emit("altitude2", altitude2);

      if ((altitude2 > oldAlt2) && (apogee == null)) {
        maxAlt2 = altitude2 - minAlt2;
      } 
      else if (altitude2 > apogee) {
        maxAlt2 = altitude2 - minAlt2;
      }
    }
    if ((oldHmd2 !== null) && (oldTmp2 !== null) && (oldPrs2 !== null) && (oldAlt2 !== null)) {
      alti2stat = true;
    }

    // If accelerometer data is available, emit it to the client
    if ((accelerationX !== null) && (oldAccX == null)) {
      console.log("Sending acceleration X to client.");
      socket.emit("accelX", accelerationX);

      // Store old accelerationX
      oldAccX = accelerationX;
    } else if ((accelerationX !== null) && ((accelerationX <= (oldAccX + 20)) && (accelerationX >= (oldAccX - 20)))) {
      console.log("Sending acceleration X to client.");
      socket.emit("accelX", accelerationX);

      oldAccX = accelerationX;
    }
    if ((accelerationY !== null) && (oldAccY == null)) {
      console.log("Sending acceleration Y to client.");
      socket.emit("accelY", accelerationY);

      // Store old accelerationY
      oldAccY = accelerationY;
    } else if ((accelerationY !== null) && ((accelerationY <= (oldAccY + 20)) && (accelerationY >= (oldAccY - 20)))) {
      console.log("Sending acceleration Y to client.");
      socket.emit("accelY", accelerationY);

      oldAccY = accelerationY;
    }
    if ((accelerationZ !== null) && (oldAccZ == null)) {
      console.log("Sending acceleration Z to client.");
      socket.emit("accelZ", accelerationZ);

      // Store old accelerationZ
      oldAccZ = accelerationZ;
    } else if ((accelerationZ !== null) && ((accelerationZ <= (oldAccZ + 20)) && (accelerationZ >= (oldAccZ - 20)))) {
      console.log("Sending acceleration Z to client.");
      socket.emit("accelZ", accelerationZ);

      oldAccZ = accelerationZ;
    }
    if ((oldAccX !== null) && (oldAccY !== null) && (oldAccZ !== null)) {
      accStat = true;
    }

    if ((oldAccX !== null && oldAccY !== null && oldAccZ !== null) && oldtotalAcc == null) {
      totalAccel = Math.round(Math.sqrt((oldAccX**2) + (oldAccY ** 2) + (oldAccZ ** 2)) * 1000) / 1000;
      console.log("Sending total acceleration to client.");
      socket.emit("totalAccel", totalAccel);
      oldtotalAcc = totalAccel;
    } else {
      totalAccel = Math.round(Math.sqrt((oldAccX**2) + (oldAccY ** 2) + (oldAccZ ** 2)) * 1000) / 1000;
      console.log("Sending total acceleration to client.");
      socket.emit("totalAccel", totalAccel);
      if (totalAccel < oldtotalAcc) {
        maxAccel = totalAccel;
      }
      oldtotalAcc = totalAccel;
    }

    // If IMU data is available, emit to client
    if ((gyroX !== null) && (oldgyroX == null)) {
      console.log("Sending gyroscope X to client.");
      socket.emit("gyroX", gyroX);

      // Store old gyroX
      oldgyroX = gyroX;
    } else if ((gyroX !== null) && ((gyroX <= (oldgyroX + 5)) && (gyroX >= (oldgyroX - 5)))) {
      console.log("Sending gyroscope X to client.");
      socket.emit("gyroX", gyroX);

      oldgyroX = gyroX;
    }
    if ((gyroY !== null) && (oldgyroY == null)) {
      console.log("Sending gyroscope Y to client.");
      socket.emit("gyroY", gyroY);

      // Store old gyroY
      oldgyroY = gyroY;
    } else if ((gyroY !== null) && ((gyroY <= (oldgyroY + 5)) && (gyroY >= (oldgyroY - 5)))) {
      console.log("Sending gyroscope Y to client.");
      socket.emit("gyroY", gyroY);

      oldgyroY = gyroY;
    }
    if ((gyroZ !== null) && (oldgyroZ == null)) {
      console.log("Sending gyroscope Z to client.");
      socket.emit("gyroZ", gyroZ);

      // Store old gyroZ
      oldgyroZ = gyroZ;
    } else if ((gyroZ !== null) && ((gyroZ <= (oldgyroZ + 5)) && (gyroZ >= (oldgyroZ - 5)))) {
      console.log("Sending gyroscope Z to client.");
      socket.emit("gyroZ", gyroZ);

      oldgyroZ = gyroZ;
    }  

    logSensorData();
    
    // Update status to nominal
    if ((gnssStat == true) && (alti1stat == true) && (alti2stat == true) && (accStat == true) && (IMUstat == true)) {
      missionStatus = "nominal";
      socket.emit("missionStatus", missionStatus);
    }

    // Calculated values

    // Maxes
    if ((maxAlt1 !== null) && (maxAlt2 !== null)) {
      apogee = Math.round(((maxAlt1 + maxAlt2) / 2) * 1000) / 1000;
      console.log("Sending apogee to client");
      socket.emit("apogee", apogee);
    }
    if (maxAccel !== null) {
      console.log("Sending max acceleration to client");
      socket.emit("maxAccel", maxAccel);
    }
    if ((maxHum1 !== null) && (maxHum2 !== null)) {
      compmaxHum = Math.round(((maxHum1 + maxHum2) / 2) * 1000) / 1000;
      console.log("Sending max humidity to client");
      socket.emit("maxHum", compmaxHum);
    }
    if ((maxTemp1 !== null) && (maxTemp2 !== null)) {
      compmaxTemp = Math.round(((maxTemp1 + maxTemp2) / 2) * 1000) / 1000;
      console.log("Sending max temperature to client");
      socket.emit("maxTemp", compmaxTemp);
    }
    if ((maxPress1 !== null) && (maxPress2 !== null)) {
      compmaxPress = Math.round(((maxPress1 + maxPress2) / 2) * 1000) / 1000;
      console.log("Sending max pressure to client");
      socket.emit("maxPress", compmaxPress);
    }

    // Minimums
    if ((minAlt1 !== null) && (minAlt2 !== null)) {
      compminAlt = Math.round(((minAlt1 + minAlt2) / 2) * 1000) / 1000;
      console.log("Sending min altitude to client");
      socket.emit("minAlt", compminAlt);
    }
    if ((minHum1 !== null) && (minHum2 !== null)) {
      compminHum = Math.round(((minHum1 + minHum2) / 2) * 1000) / 1000;
      console.log("Sending min humidity to client");
      socket.emit("minHum", compminHum);
    }
    if ((minTemp1 !== null) && (minTemp2 !== null)) {
      compmaxTemp = Math.round(((minTemp1 + minTemp2) / 2) * 1000) / 1000;
      console.log("Sending min temperature to client");
      socket.emit("minTemp", compminTemp);
    }
    if ((minPress1 !== null) && (minPress2 !== null)) {
      compminPress = Math.round(((minPress1 + minPress2) / 2) * 1000) / 1000;
      console.log("Sending min pressure to client");
      socket.emit("minPress", compminPress);
    }

  });

  // Handle socket disconnect event
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 
