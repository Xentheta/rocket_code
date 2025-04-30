/*const { SerialPort } = require("serialport");  // Import SerialPort correctly
const { ReadlineParser } = require("@serialport/parser-readline");  // Import ReadlineParser
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

// Create the parser for reading data
const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

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
}); */

//###################################
// Variables to store sensor readings
//###################################

// GPS variables
let latitude = null;
let longitude = null;

// Altimeter variables
let humidity1 = null;
let temperature1 = null;
let pressure1 = null;
let altitude1 = null;

let humidity2 = null;
let temperature2 = null;
let pressure2 = null;
let altitude2 = null;

// Accelerometer variables
let accelerationX = null;
let accelerationY = null;
let accelerationZ = null;
let totalAccel = null;

/* // Interpret data
io.on("connection", (socket) => {
  console.log("Client connected to socket.io");

  // Send data to the client when it arrives from the serial port
  parser.on("data", (data) => {
    console.log("Received raw data from serial port:", data);  // Log raw data to check

    // Clean the data
    data = data.trim().replace(/[\r\n]+/g, " ");  // Remove any unwanted characters
    console.log("Cleaned data:", data);  // Log cleaned data to verify

    // Check if the data contains any sensor value identifiers and emit to client
    
    // GPS
    // Latitude
    if (data.startsWith("Latitude:")) {
      const lat = parseFloat(data.split(":")[1].trim());
      if (!isNaN(lat)) {
        latitude = lat;
        console.log("Latitude received:", latitude);
      } else {
        console.log("Invalid latitude data:", data);
      }
    } 
    
    // Longitude
    else if (data.startsWith("Longitude:")) {
      const lon = parseFloat(data.split(":")[1].trim());
      if (!isNaN(lon)) {
        longitude = lon;
        console.log("Longitude received:", longitude);
      } else {
        console.log("Invalid longitude data:", data);
      }
    } 
    
    // Altimeter 1
    // Humidity
    else if (data.startsWith("Humidity1:")) {
      const humid1 = parseFloat(data.split(":")[1].trim());
      if (!isNaN(humid1)) {
        humidity1 = humid1;
        console.log("Humidity1 received:", humidity1);
      } else {
        console.log("Invalid humidity1 data:", data);
      }
    } 
    
    // Temperature
    else if (data.startsWith("Temperature1:")) {
      const temp1 = parseFloat(data.split(":")[1].trim());
      if (!isNaN(temp1)) {
        temperature1 = temp1;
        console.log("Temperature1 received:", temperature1);
      } else {
        console.log("Invalid temperature1 data:", data);
      }
    } 
    
    // Pressure
    else if (data.startsWith("Pressure1:")) {
      const press1 = parseFloat(data.split(":")[1].trim());
      if (!isNaN(press1)) {
        pressure1 = press1;
        console.log("Pressure1 received:", pressure1);
      } else {
        console.log("Invalid pressure1 data:", data);
      }
    } 

    // Altitude
    else if (data.startsWith("Altitude1:")) {
      const alti1 = parseFloat(data.split(":")[1].trim());
      if (!isNaN(alti1)) {
        altitude1 = alti1;
        console.log("Altitude1 received:", altitude1);
      } else {
        console.log("Invalid altitude1 data:", data);
      }
    }
    
    // Altimeter 2
    // Humidity
    else if (data.startsWith("Humidity2:")) {
      const humid2 = parseFloat(data.split(":")[1].trim());
      if (!isNaN(humid2)) {
        humidity2 = humid2;
        console.log("Humidity2 received:", humidity1);
      } else {
        console.log("Invalid humidity2 data:", data);
      }
    } 
    
    // Temperature
    else if (data.startsWith("Temperature2:")) {
      const temp2 = parseFloat(data.split(":")[1].trim());
      if (!isNaN(temp2)) {
        temperature2 = temp2;
        console.log("Temperature2 received:", temperature2);
      } else {
        console.log("Invalid temperature2 data:", data);
      }
    } 
    
    // Pressure
    else if (data.startsWith("Pressure2:")) {
      const press2 = parseFloat(data.split(":")[1].trim());
      if (!isNaN(press2)) {
        pressure2 = press2;
        console.log("Pressure2 received:", pressure2);
      } else {
        console.log("Invalid pressure2 data:", data);
      }
    } 

    // Altitude
    else if (data.startsWith("Altitude2:")) {
      const alti2 = parseFloat(data.split(":")[1].trim());
      if (!isNaN(alti2)) {
        altitude2 = alti2;
        console.log("Altitude2 received:", altitude2);
      } else {
        console.log("Invalid altitude2 data:", data);
      }
    }

    // Accelerometer data
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
    }

    // If both latitude and longitude are available, emit them to the client
    if (latitude !== null) {
      console.log("Sending latitude to client.");
      socket.emit("latitude", latitude);

      // Reset the latitude
      latitude = null;
    } 
    if (longitude !== null) {
      console.log("Sending longitude to client.");
      socket.emit("longitude", longitude);

      // Reset the longitude
      longitude = null;
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

*/

const { SerialPort } = require("serialport");


function extractSingleByteValue(line) {
  const parts = line.split(":");
  const raw = parts[1]?.trim();

  if (raw && raw.length === 1) {
    // Get the ASCII code of the character
    return raw.charCodeAt(0);
  }

  return NaN; // fallback
}


const port = new SerialPort({
  path: "COM9",  // update if needed
  baudRate: 230400,
});

port.on("open", () => {
  console.log("Port opened");
});

port.on("data", (data) => {
  data = data.toString();
  console.log(data);  // or just `data` for buffer
  data = data.trim().replace(/[\r\n]+/g, " ");  // Remove any unwanted characters
  console.log("Cleaned data:", data);  // Log cleaned data to verify

  const lines = data.split(/[\r\n]+/);
  for (const line of lines) {
    // Check if the data contains any sensor value identifiers and emit to client
    

    const cleanedLine = line.trim();
  
    if (cleanedLine.startsWith("Latitude:")) {
        const lat = parseFloat(cleanedLine.split(":")[1].trim());
      if (!isNaN(lat)) {
          console.log("Latitude received:", lat);
        } else {
          console.log("Invalid latitude data:", cleanedLine);
        }
      } else if (cleanedLine.startsWith("Longitude:")) {
        const lon = parseFloat(cleanedLine.split(":")[1].trim());
        if (!isNaN(lon)) {
          console.log("Longitude received:", lon);
        } else {
          console.log("Invalid longitude data:", cleanedLine);
        }
      } else if (line.startsWith("Humidity1:")) {
        const humid1 = extractSingleByteValue(line) / 1000;
        if (!isNaN(humid1)) {
          console.log("Humidity1 received:", humid1);
        } else {
          console.log("Invalid humidity1 data:", line);
        }
      }
      }
    // Temperature
    if (data.startsWith("Temperature1:")) {
      const temp1 = parseFloat(data.split(":")[1].trim());
      if (!isNaN(temp1)) {
        temperature1 = temp1;
        console.log("Temperature1 received:", temperature1);
      } else {
        console.log("Invalid temperature1 data:", data);
      }
    } 
    
    // Pressure
    else if (data.startsWith("Pressure1:")) {
      const press1 = parseFloat(data.split(":")[1].trim());
      if (!isNaN(press1)) {
        pressure1 = press1;
        console.log("Pressure1 received:", pressure1);
      } else {
        console.log("Invalid pressure1 data:", data);
      }
    } 

    // Altitude
    else if (data.startsWith("Altitude1:")) {
      const alti1 = parseFloat(data.split(":")[1].trim());
      if (!isNaN(alti1)) {
        altitude1 = alti1;
        console.log("Altitude1 received:", altitude1);
      } else {
        console.log("Invalid altitude1 data:", data);
      }
    }
    
    // Altimeter 2
    // Humidity
    else if (data.startsWith("Humidity2:")) {
      const humid2 = parseFloat(data.split(":")[1].trim());
      if (!isNaN(humid2)) {
        humidity2 = humid2;
        console.log("Humidity2 received:", humidity1);
      } else {
        console.log("Invalid humidity2 data:", data);
      }
    } 
    
    // Temperature
    else if (data.startsWith("Temperature2:")) {
      const temp2 = parseFloat(data.split(":")[1].trim());
      if (!isNaN(temp2)) {
        temperature2 = temp2;
        console.log("Temperature2 received:", temperature2);
      } else {
        console.log("Invalid temperature2 data:", data);
      }
    } 
    
    // Pressure
    else if (data.startsWith("Pressure2:")) {
      const press2 = parseFloat(data.split(":")[1].trim());
      if (!isNaN(press2)) {
        pressure2 = press2;
        console.log("Pressure2 received:", pressure2);
      } else {
        console.log("Invalid pressure2 data:", data);
      }
    } 

    // Altitude
    else if (data.startsWith("Altitude2:")) {
      const alti2 = parseFloat(data.split(":")[1].trim());
      if (!isNaN(alti2)) {
        altitude2 = alti2;
        console.log("Altitude2 received:", altitude2);
      } else {
        console.log("Invalid altitude2 data:", data);
      }
    }

    // Accelerometer data
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
    }
  
    // If both latitude and longitude are available, emit them to the client
    if (latitude !== null) {
      console.log("Sending latitude to client.");
      socket.emit("latitude", latitude);

      // Reset the latitude
      latitude = null;
    } 
    if (longitude !== null) {
      console.log("Sending longitude to client.");
      socket.emit("longitude", longitude);

      // Reset the longitude
      longitude = null;
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

port.on("error", (err) => {
  console.error("Serial error:", err);
}); 
