const { SerialPort } = require("serialport");  // Import SerialPort correctly
const { ReadlineParser } = require("@serialport/parser-readline");  // Import ReadlineParser
const http = require("http");
const socketIo = require("socket.io");

// Configure and open the serial port
const port = new SerialPort({
  path: "COM8",  // Replace with your serial port path
  baudRate: 9600,
  dataBits: 8,
  parity: "none",
  stopBits: 1,
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
});

// Variables to store latitude and longitude
let latitude = null;
let longitude = null;

io.on("connection", (socket) => {
  console.log("Client connected to socket.io");

  // Send data to the client when it arrives from the serial port
  parser.on("data", (data) => {
    console.log("Received raw data from serial port:", data);  // Log raw data to check

    // Clean the data
    data = data.trim().replace(/[\r\n]+/g, " ");  // Remove any unwanted characters
    console.log("Cleaned data:", data);  // Log cleaned data to verify

    // Check if the data contains latitude or longitude, and ensure it's correct
    if (data.startsWith("Latitude:")) {
      const lat = parseFloat(data.split(":")[1].trim());
      if (!isNaN(lat)) {
        latitude = lat;
        console.log("Latitude received:", latitude);
      } else {
        console.log("Invalid latitude data:", data);
      }
    } else if (data.startsWith("Longitude:")) {
      const lon = parseFloat(data.split(":")[1].trim());
      if (!isNaN(lon)) {
        longitude = lon;
        console.log("Longitude received:", longitude);
      } else {
        console.log("Invalid longitude data:", data);
      }
    }

    // If both latitude and longitude are available, emit them to the client
    if (latitude !== null && longitude !== null) {
      console.log("Both latitude and longitude received, sending to client.");
      socket.emit("latitude", latitude);
      socket.emit("longitude", longitude);

      // Reset the latitude and longitude to await new data
      latitude = null;
      longitude = null;
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
