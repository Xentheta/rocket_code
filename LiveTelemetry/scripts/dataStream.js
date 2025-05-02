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
let accelerationX = null;
let accelerationY = null;
let accelerationZ = null;
let totalAccel = null;


io.on("connection", (socket) => {
  console.log("Client connected to socket.io");

  port.on("data", (data) => {

    let hexData = (data.toString('hex')).toUpperCase();
  
    console.log(hexData);
    const cleanedLine = "skibidi";
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


    if (cleanedLine.startsWith("Latitude:")) {
        const lat = parseFloat(cleanedLine.split(":")[1].trim());
      if (!isNaN(lat)) {
          console.log("Latitude received:", lat);
      } else {
          console.log("Invalid latitude data:", cleanedLine);
      }
    } 
    else if (cleanedLine.startsWith("Longitude:")) {
      const lon = parseFloat(cleanedLine.split(":")[1].trim());
      if (!isNaN(lon)) {
        console.log("Longitude received:", lon);
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

    /*// Accelerometer data
    else if (data.startsWith("accelX:")) {
      const accelX = parseFloat(data.split(":")[1].trim());
      if (!isNaN(accelX)) {
        accelerationX = accelX;
        console.log("Acceleration X received:", accelerationX);
      } else {
        console.log("Invalid Acceleration X data:", data);
      }
    }
    else if (data.startsWith("accelY:")) {
      const accelY = parseFloat(data.split(":")[1].trim());
      if (!isNaN(accelY)) {
        accelerationY = accelY;
        console.log("Acceleration Y received:", accelerationY);
      } else {
        console.log("Invalid Acceleration Y data:", data);
      }
    }
    else if (data.startsWith("accelZ:")) {
      const accelZ = parseFloat(data.split(":")[1].trim());
      if (!isNaN(accelZ)) {
        accelerationZ = accelZ;
        console.log("Acceleration Z received:", accelerationZ);
      } else {
        console.log("Invalid Acceleration Z data:", data);
      }
    } */
  
    // If both latitude and longitude are available, emit them to the client
    if ((latitude !== null) && (oldLat == null)) {
      console.log("Sending latitude to client.");
      socket.emit("latitude", latitude);

      // Reset the latitude
      latitude = oldLat;
    } else if ((latitude !== null) && ((latitude <= (oldLat + 0.003)) || (latitude >= (oldLat - 0.003)))) {
      console.log("Sending latitude to client.");
      socket.emit("latitude", latitude);

      latitude = oldLat;
    }
    if ((longitude !== null) && (oldLon == null)) {
      console.log("Sending longitude to client.");
      socket.emit("longitude", longitude);

      // Reset the latitude
      longitude = oldLon;
    } else if ((longitude !== null) && ((longitude <= (oldLon + 0.003)) || (longitude >= (oldLon - 0.003)))) {
      console.log("Sending longitude to client.");
      socket.emit("longitude", longitude);

      longitude = oldLon;
    }

    // If altimeter 1 data is available, emit it to the client
    if (humidity1 !== null) {
      console.log("Sending humidity1 to client.");
      socket.emit("humidity1", humidity1);

      // Reset the humidity1
      humidity1 = null;
    } 
    if (temperature1 !== null) {
      console.log("Sending temperature1 to client.");
      socket.emit("temperature1", temperature1);

      // Reset the temperature1
      temperature1 = null;
    }
    if (pressure1 !== null) {
      console.log("Sending pressure1 to client.");
      socket.emit("pressure1", pressure1); 

      // Reset the temperature1
      pressure1 = null;
    }
    if (altitude1 !== null) {
      console.log("Sending temperature1 to client.");
      socket.emit("altitude1", altitude1);

      // Reset the temperature1
      altitude1 = null;
    }

    // If altimeter 2 data is available, emit it to the client
    if (humidity2 !== null) {
      console.log("Sending humidity2 to client.");
      socket.emit("humidity2", humidity2);

      // Reset the humidity1
      humidity2 = null;
    } 
    if (temperature2 !== null) {
      console.log("Sending temperature2 to client.");
      socket.emit("temperature2", temperature2);

      // Reset the temperature1
      temperature2 = null;
    }
    if (pressure2 !== null) {
      console.log("Sending pressure2 to client.");
      socket.emit("pressure2", pressure2); 

      // Reset the temperature1
      pressure2 = null;
    }
    if (altitude2 !== null) {
      console.log("Sending temperature2 to client.");
      socket.emit("altitude2", altitude2);

      // Reset the temperature1
      altitude2 = null;
    }

    // If accelerometer data is available, emit it to the client
    if (accelerationX !== null) {
      console.log("Sending acceleration X to client.");
      socket.emit("accelX", accelerationX);

      // Reset the humidity1
      accelerationX = null;
    } 
    if (accelerationY !== null) {
      console.log("Sending acceleration Y to client.");
      socket.emit("accelY", accelerationY);

      // Reset the humidity1
      accelerationY = null;
    } 
    if (accelerationZ !== null) {
      console.log("Sending acceleration Z to client.");
      socket.emit("accelZ", accelerationZ);

      // Reset the humidity1
      accelerationZ = null;
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
