const { SerialPort } = require("serialport");  // Import SerialPort correctly
const http = require("http");
const socketIo = require("socket.io");

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

//###################################
// Variables to store sensor readings
//###################################

// GPS variables
let latitude = null, longitude = null;
let oldLat = null, oldLon = null;

// Altimeter variables
let humidity1 = null , temperature1 = null, pressure1 = null, altitude1 = null;
let oldHmd1 = null, oldTmp1 = null, oldPrs1 = null, oldAlt1 = null;

let humidity2 = null, temperature2 = null, pressure2 = null, altitude2 = null;
let oldHmd2 = null, oldTmp2 = null, oldPrs2 = null, oldAlt2 = null;

// Accelerometer variables
let accelerationX = null, accelerationY = null, accelerationZ = null;
let oldAccX = null, oldAccY = null, oldAccZ = null;
let totalAccel = null;

// Function for handling signed values

function signedHex(hex, byteLength) {
  const val = parseInt(hex, 16);
  const max = Math.pow(2, byteLength * 8);
  const limit = max / 2;
  return (val >= limit) ? val - max : val;
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
    const accelXPrefix = "416363583A"
    const accelYPrefix = "416363593A"
    const accelZPrefix = "4163635A3A"

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
    ////////////// Altimeter 1

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

    /////////// Altimeter 2

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
  
    // If both latitude and longitude are available, emit them to the client
    if ((latitude !== null) && (oldLat == null)) {
      console.log("Sending latitude to client.");
      socket.emit("latitude", latitude);

      // Store old latitude
      oldLat = latitude;
    } else if ((latitude !== null) && ((latitude <= (oldLat + 0.003)) || (latitude >= (oldLat - 0.003)))) {
      console.log("Sending latitude to client.");
      socket.emit("latitude", latitude);

      oldLat = latitude;
    }
    if ((longitude !== null) && (oldLon == null)) {
      console.log("Sending longitude to client.");
      socket.emit("longitude", longitude);

      // Store old longitude
      oldLon = longitude;
    } else if ((longitude !== null) && ((longitude <= (oldLon + 0.003)) || (longitude >= (oldLon - 0.003)))) {
      console.log("Sending longitude to client.");
      socket.emit("longitude", longitude);

      oldLon = longitude;
    }

    // If altimeter 1 data is available, emit it to the client
    if ((humidity1 !== null) && (oldHmd1 == null)) {
      console.log("Sending humidity1 to client.");
      socket.emit("humidity1", humidity1);

      // Store old humidity1
      oldHmd1 = humidity1;
    } else if ((humidity1 !== null) && ((humidity1 <= (oldHmd1 + 10)) || (humidity1 >= (oldHmd1 - 10)))) {
      console.log("Sending humidity1 to client.");
      socket.emit("humidity1", humidity1);

      oldHmd1 = humidity1;
    }
    if ((temperature1 !== null) && (oldTmp1 == null)) {
      console.log("Sending temperature1 to client.");
      socket.emit("temperature1", temperature1);

      // Store old temperature1
      oldTmp1 = temperature1;
    } else if ((temperature1 !== null) && ((temperature1 <= (oldTmp1 + 5)) || (temperature1 >= (oldTmp1 - 5)))) {
      console.log("Sending temperature1 to client.");
      socket.emit("temperature1", temperature1);

      oldTmp1 = temperature1;
    }
    if ((pressure1 !== null) && (oldPrs1 == null)) {
      console.log("Sending pressure1 to client.");
      socket.emit("pressure1", pressure1); 

      // Store old pressure1
      oldPrs1 = pressure1;
    } else if ((pressure1 !== null) && ((pressure1 <= (oldPrs1 + 2000)) || (pressure1 >= (oldPrs1 - 2000)))) {
      console.log("Sending pressure1 to client.");
      socket.emit("pressure1", pressure1); 

      oldPrs1 = pressure1;
    }
    if ((altitude1 !== null) && (oldAlt1 == null)) {
      console.log("Sending altitude1 to client.");
      socket.emit("altitude1", altitude1);

      // Store old altitude1
      oldAlt1 = altitude1;
    } else if ((altitude1 !== null) && ((altitude1 <= (oldAlt1 + 300)) || (altitude1 >= (oldAlt1 - 300)))) {
      console.log("Sending altitude1 to client.");
      socket.emit("altitude1", altitude1);

      oldAlt1 = altitude1;
    }

    // If altimeter 2 data is available, emit it to the client
    if ((humidity2 !== null) && (oldHmd2 == null)) {
      console.log("Sending humidity2 to client.");
      socket.emit("humidity2", humidity2);

      // Store old humidity2
      oldHmd2 = humidity2;
    } else if ((humidity2 !== null) && ((humidity2 <= (oldHmd2 + 10)) || (humidity2 >= (oldHmd2 - 10)))) {
      console.log("Sending humidity2 to client.");
      socket.emit("humidity2", humidity2);

      oldHmd1 = humidity1;
    }
    if ((temperature2 !== null) && (oldTmp2 == null)) {
      console.log("Sending temperature2 to client.");
      socket.emit("temperature2", temperature2);

      // Store old temperature2
      oldTmp2 = temperature2;
    } else if ((temperature2 !== null) && ((temperature2 <= (oldTmp2 + 5)) || (temperature2 >= (oldTmp2 - 5)))) {
      console.log("Sending temperature2 to client.");
      socket.emit("temperature2", temperature2);

      oldTmp2 = temperature2;
    }
    if ((pressure2 !== null) && (oldPrs2 == null)) {
      console.log("Sending pressure2 to client.");
      socket.emit("pressure2", pressure2); 

      // Store old pressure2
      oldPrs2 = pressure2;
    } else if ((pressure2 !== null) && ((pressure2 <= (oldPrs2 + 2000)) || (pressure2 >= (oldPrs2 - 2000)))) {
      console.log("Sending pressure2 to client.");
      socket.emit("pressure2", pressure2); 

      oldPrs2 = pressure2;
    }
    if ((altitude2 !== null) && (oldAlt2 == null)) {
      console.log("Sending altitude2 to client.");
      socket.emit("altitude2", altitude2);

      // Store old altitude2
      oldAlt2 = altitude2;
    } else if ((altitude2 !== null) && ((altitude2 <= (oldAlt2 + 300)) || (altitude2 >= (oldAlt2 - 300)))) {
      console.log("Sending altitude2 to client.");
      socket.emit("altitude2", altitude2);

      oldAlt2 = altitude2;
    }

    // If accelerometer data is available, emit it to the client
    if ((accelerationX !== null) && (oldAccX == null)) {
      console.log("Sending acceleration X to client.");
      socket.emit("accelX", accelerationX);

      // Store old accelerationX
      oldAccX = accelerationX;
    } else if ((accelerationX !== null) && ((accelerationX <= (oldAccX + 5)) || (accelerationX >= (oldAccX - 5)))) {
      console.log("Sending acceleration X to client.");
      socket.emit("accelX", accelerationX);

      oldAccX = accelerationX;
    }
    if ((accelerationY !== null) && (oldAccY == null)) {
      console.log("Sending acceleration Y to client.");
      socket.emit("accelY", accelerationY);

      // Store old accelerationY
      oldAccY = accelerationY;
    } else if ((accelerationY !== null) && ((accelerationY <= (oldAccY + 5)) || (accelerationY >= (oldAccY - 5)))) {
      console.log("Sending acceleration Y to client.");
      socket.emit("accelY", accelerationY);

      oldAccY = accelerationY;
    }
    if ((accelerationZ !== null) && (oldAccZ == null)) {
      console.log("Sending acceleration Z to client.");
      socket.emit("accelZ", accelerationZ);

      // Store old accelerationZ
      oldAccZ = accelerationZ;
    } else if ((accelerationZ !== null) && ((accelerationZ <= (oldAccZ + 5)) || (accelerationZ >= (oldAccZ - 5)))) {
      console.log("Sending acceleration Z to client.");
      socket.emit("accelZ", accelerationZ);

      oldAccZ = accelerationZ;
    }
    if (oldAccX != null && oldAccY != null && oldAccZ != null) {
      totalAccel = Math.round(Math.sqrt((oldAccX**2) + (oldAccY ** 2) + (oldAccZ ** 2)) * 1000) / 1000;
      console.log("Sending total acceleration to client.");
      socket.emit("totalAccel", totalAccel);
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
