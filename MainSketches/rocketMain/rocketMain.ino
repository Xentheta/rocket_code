//GNSS Reciever
#include <SparkFun_u-blox_GNSS_v3.h>
#include <u-blox_Class_and_ID.h>
#include <u-blox_GNSS.h>
#include <u-blox_config_keys.h>
#include <u-blox_external_typedefs.h>
#include <u-blox_structs.h>

//Altimeters
#include <SparkFunBME280.h>

//Accelerometer
#include <SparkFun_KX13X.h>

//IMU
#include <SparkFun_ISM330DHCX.h>

//Extras
#include <Wire.h>
#include <sfe_bus.h>
#include <sfe_ism_shim.h>
#include <math.h>
#include "FS.h"
#include "SD.h"
#include "SPI.h"

// Class definitions
BME280 atmoSensor1;
BME280 atmoSensor2; 
SFE_UBLOX_GNSS myGNSS;
SparkFun_KX132 kxAccel;
SparkFun_ISM330DHCX myISM;

// Data Structs for IMU and Accelerometer
outputData myData; 
sfe_ism_data_t aData;
sfe_ism_data_t gyroData;

//////// global variables ////////

//floats to be used in getting the GPS data
int32_t latitude, longitude;
float store_lat, store_lon;

//floats to be used in getting the data from the BME sensors
float humidity1, temperature1, altitude1, pressure1; 
float humidity2, temperature2, altitude2, pressure2;

//Accelerometer variables
float accelX, accelY, accelZ;

//Gyroscope variables
float gyroX, gyroY, gyroZ;


//definitions for the SPI/SD card interface
int sck = 18;
int miso = 19;
int mosi = 23;
int cs = 5;

bool gotAllClear = false;

//////// Debug Flags ////////

#define logData true //change to true to log data to SD card
#define clearFS true //change to true to clean FS on Startup
#define waitForAllClear false //change to true to clean FS on Startup

///////////////////////////////////////////////////////////
////////////////////// Core Functions /////////////////////
///////////////////////////////////////////////////////////

void setup() {

  Serial.begin(9600);
  Serial1.begin(230400);
  Wire.begin(21, 22);
  Wire.setClock(400000);

  //Initialize GNSS
  while (myGNSS.begin() == false) //Connect to the u-blox module using Wire port
  {
    Serial.println(F("u-blox GNSS not detected at default I2C address. Retrying..."));
    delay (1000);
  }
  myGNSS.setI2COutput(COM_TYPE_UBX);

  //Initialize Altimeters
  if (atmoSensor1.beginI2C() == false)
  {
    Serial.println("Sensor is not responding.");
    while(1);
  }

  if (atmoSensor2.beginI2C() == false)
  {
    Serial.println("Sensor is not responding.");
    while(1);
  }
  
  //Initialize Accelerometer
  if (!kxAccel.begin(0x1F))
  {
    Serial.println("Could not communicate with the the KX13X. Freezing.");
    while (1);
  }
  kxAccel.enableAccel(false);
  kxAccel.setRange(SFE_KX132_RANGE16G); // 16g Range 
  kxAccel.enableDataEngine(); // Enables the bit that indicates data is ready.
  kxAccel.enableAccel();

  //Initialize IMU
  /*while (!myISM.begin())
	{
		Serial.println("ISM did not begin. Please check the wiring...");
		delay(1000);
	}
	myISM.deviceReset();

	// Wait for it to finish reseting
	while( !myISM.getDeviceReset() ){ 
		delay(1);
	} 
	
	myISM.setDeviceConfig();
	myISM.setBlockDataUpdate();

  myISM.setAccelDataRate(ISM_XL_ODR_104Hz);
	myISM.setAccelFullScale(ISM_4g); 
  myISM.setAccelFilterLP2();
	myISM.setAccelSlopeFilter(ISM_LP_ODR_DIV_100);

	// Set the output data rate and precision of the gyroscope
	myISM.setGyroDataRate(ISM_GY_ODR_104Hz);
	myISM.setGyroFullScale(ISM_500dps); 

	// Turn on the gyroscope's filter and apply settings. 
	myISM.setGyroFilterLP1();
	myISM.setGyroLP1Bandwidth(ISM_MEDIUM); */

 //////////initialize SD card////////////
  SPI.begin(sck, miso, mosi, cs);
    if(!SD.begin(cs)){
        Serial.println("Card Mount Failed");
        return;
  }

  //let system settle. TODO-- possibly unnecessary
  delay(1000);

  if(clearFS){
    File root = SD.open("/");
    File file = root.openNextFile();
    while (file) {
      Serial.print("Erasing file: ");
      Serial.println(file.path());
      SD.remove(file.path());
      file = root.openNextFile();
    }
  }

    //write headers for .csv files
  writeFile(SD, "/GNSS.csv", "Latitude, longitude, Altitude, ");
  writeFile(SD, "/BME1.csv", "Humidity, Temp, Pressure, Altitude, ");  
  writeFile(SD, "/BME2.csv", "Humidity, Temp, Pressure, Altitude, "); 
  writeFile(SD, "/ACCEL.csv", "X Accel, Y Accel, Z Accel, ");
  writeFile(SD, "/IMU.csv", "X Rot, Y Rot, Z Rot, ");

  //if the system is set to wait for all clear, wait for all clear
  if(waitForAllClear) {
    while(!gotAllClear){
      if(Serial.available() > 0){
        String in = Serial.readString();

        if(in.indexOf("all_clear") > 0){
          gotAllClear = true;
        } else if(in.indexOf("restart") > 0){
          ESP.restart();
        } else {
          Serial.println("ERROR READING START");
        }
      }
    }
  }
}

void loop() {

  getGNSSData();

  getBME1Data();

  getBME2Data();

  getAccelData();

  /*getIMUdata();
  delay(1000); */
}

//////////////// Sensor Functions ///////////////////

void getGNSSData(){  //prints the data for the GNSS sensor. Can also log data to SD if enabled 
  char dataBuf [20];

  if (myGNSS.getPVT() == true)
  {
    latitude = myGNSS.getLatitude();
    longitude = myGNSS.getLongitude();
    store_lat = latitude / 10000000;
    store_lon = longitude / 10000000;

    Serial.print("Latitude: ");
    Serial.println(store_lat, 7);
    Serial.print("Longitude: ");
    Serial.println(store_lon, 7);

    uint8_t LatPacket[8] = "Lat:";
    uint8_t LonPacket[8] = "Lon:";

    LatPacket[4] = (latitude >> 24)  & 0xFF;   // MSB
    LatPacket[5] = (latitude >> 16)  & 0xFF;
    LatPacket[6] = (latitude >> 8)  & 0xFF;
    LatPacket[7] = latitude & 0xFF;            // LSB
    Serial1.write(LatPacket, 8);            // send 8 bytes total
    delay(100);

    LonPacket[4] = (longitude >> 24)  & 0xFF;  // MSB
    LonPacket[5] = (longitude >> 16)  & 0xFF;
    LonPacket[6] = (longitude >> 8)  & 0xFF;
    LonPacket[7] = longitude & 0xFF;           // LSB
    Serial1.write(LonPacket, 8);            // send 8 bytes total
    delay(100);

    if(logData){
      appendFile(SD, "/GNSS.csv", "\n");
      sprintf(dataBuf, "%d, ", store_lat);
      appendFile(SD, "/GNSS.csv", dataBuf);
      sprintf(dataBuf, "%d, ", store_lon);
      appendFile(SD, "/GNSS.csv", dataBuf);
      /*sprintf(dataBuf, "%d, ", altitude);
      appendFile(SD, "/GNSS.csv", dataBuf);*/
    }
  }
}

void getBME1Data(){
  char dataBuf [20];

  // Get and transmit data
  humidity1 = atmoSensor1.readFloatHumidity();
  temperature1 = atmoSensor1.readTempF();
  pressure1 = atmoSensor1.readFloatPressure();
  altitude1 = atmoSensor1.readFloatAltitudeFeet();
  int humidity1_TX = humidity1 * 1000;
  int temperature1_TX = temperature1 * 1000;
  int pressure1_TX = pressure1 * 1000;
  int altitude1_TX = altitude1 * 1000;

  Serial.print("Humidity: ");
  Serial.println(humidity1);
  Serial.print("Temperature: ");
  Serial.println(temperature1);
  Serial.print("Pressure: ");
  Serial.println(pressure1);
  Serial.print("Altitude: ");
  Serial.println(altitude1);

  uint8_t humid1Packet[8] = "Hum1:";  // 5-byte ASCII header
  uint8_t temp1Packet[8] = "Tmp1:";
  uint8_t press1Packet[9] = "Prs1:";
  uint8_t alti1Packet[8] = "Alt1:";

  humid1Packet[5] = (humidity1_TX >> 16)  & 0xFF;  // MSB
  humid1Packet[6] = (humidity1_TX >> 8)  & 0xFF;
  humid1Packet[7] = humidity1_TX & 0xFF;          // LSB
  Serial1.write(humid1Packet, 8);            // send 8 bytes total
  delay(100);

  temp1Packet[5] = (temperature1_TX >> 16)  & 0xFF;  // MSB
  temp1Packet[6] = (temperature1_TX >> 8)  & 0xFF;
  temp1Packet[7] = temperature1_TX & 0xFF;          // LSB
  Serial1.write(temp1Packet, 8);            // send 8 bytes total
  delay(100);

  press1Packet[5] = (pressure1_TX >> 24)  & 0xFF;  // MSB
  press1Packet[6] = (pressure1_TX >> 16)  & 0xFF;
  press1Packet[7] = (pressure1_TX >> 8)  & 0xFF;
  press1Packet[8] = pressure1_TX & 0xFF;          // LSB
  Serial1.write(press1Packet, 9);            // send 9 bytes total
  delay(100);

  alti1Packet[5] = (altitude1_TX >> 16)  & 0xFF;  // MSB
  alti1Packet[6] = (altitude1_TX >> 8)  & 0xFF;
  alti1Packet[7] = altitude1_TX & 0xFF;          // LSB
  Serial1.write(alti1Packet, 8);            // send 8 bytes total
  delay(100);

  if(logData){
    appendFile(SD, "/BME1.csv", "\n");
    sprintf(dataBuf, "%d, ", humidity1);
    appendFile(SD, "/BME1.csv", dataBuf);
    sprintf(dataBuf, "%d, ", temperature1);
    appendFile(SD, "/BME1.csv", dataBuf);
    sprintf(dataBuf, "%d, ", pressure1);
    appendFile(SD, "/BME1.csv", dataBuf);
    sprintf(dataBuf, "%d, ", altitude1);
    appendFile(SD, "/BME1.csv", dataBuf);
  }
}

void getBME2Data(){
  char dataBuf [20];

  // Get and transmit data
  humidity2 = atmoSensor2.readFloatHumidity();
  temperature2 = atmoSensor2.readTempF();
  pressure2 = atmoSensor2.readFloatPressure();
  altitude2 = atmoSensor2.readFloatAltitudeFeet();
  int humidity2_TX = humidity2 * 1000;
  int temperature2_TX = temperature2 * 1000;
  int pressure2_TX = pressure2 * 1000;
  int altitude2_TX = altitude2 * 1000;

  Serial.print("Humidity: ");
  Serial.println(humidity2);
  Serial.print("Temperature: ");
  Serial.println(temperature2);
  Serial.print("Pressure: ");
  Serial.println(pressure2);
  Serial.print("Altitude: ");
  Serial.println(altitude2);

  uint8_t humid2Packet[8] = "Hum2:";  // 5-byte ASCII header
  uint8_t temp2Packet[8] = "Tmp2:";
  uint8_t press2Packet[9] = "Prs2:";
  uint8_t alti2Packet[8] = "Alt2:";

  humid2Packet[5] = (humidity2_TX >> 16)  & 0xFF;  // MSB
  humid2Packet[6] = (humidity2_TX >> 8)  & 0xFF;
  humid2Packet[7] = humidity2_TX & 0xFF;          // LSB
  Serial1.write(humid2Packet, 8);            // send 8 bytes total
  delay(100);

  temp2Packet[5] = (temperature2_TX >> 16)  & 0xFF;  // MSB
  temp2Packet[6] = (temperature2_TX >> 8)  & 0xFF;
  temp2Packet[7] = temperature2_TX & 0xFF;          // LSB
  Serial1.write(temp2Packet, 8);            // send 8 bytes total
  delay(100);

  press2Packet[5] = (pressure2_TX >> 24)  & 0xFF;  // MSB
  press2Packet[6] = (pressure2_TX >> 16)  & 0xFF;
  press2Packet[7] = (pressure2_TX >> 8)  & 0xFF;
  press2Packet[8] = pressure2_TX & 0xFF;          // LSB
  Serial1.write(press2Packet, 9);            // send 9 bytes total
  delay(100);

  alti2Packet[5] = (altitude2_TX >> 16)  & 0xFF;  // MSB
  alti2Packet[6] = (altitude2_TX >> 8)  & 0xFF;
  alti2Packet[7] = altitude2_TX & 0xFF;          // LSB
  Serial1.write(alti2Packet, 8);            // send 8 bytes total
  delay(100);

  if(logData){
    appendFile(SD, "/BME2.csv", "\n");
    sprintf(dataBuf, "%d, ", humidity2);
    appendFile(SD, "/BME2.csv", dataBuf);
    sprintf(dataBuf, "%d, ", temperature2);
    appendFile(SD, "/BME2.csv", dataBuf);
    sprintf(dataBuf, "%d, ", pressure2);
    appendFile(SD, "/BME2.csv", dataBuf);
    sprintf(dataBuf, "%d, ", altitude2);
    appendFile(SD, "/BME2.csv", dataBuf);
  }
}

void getAccelData(){
  char dataBuf [20];
  
  if (kxAccel.dataReady())
  {
    kxAccel.getAccelData(&myData);

    accelX = myData.xData;
    accelY = myData.yData;
    accelZ = myData.zData;

    Serial.print("accelX: ");
    Serial.println(accelX, 4);
    Serial.print("accelY: ");
    Serial.println(accelY, 4);
    Serial.print("accelZ: ");
    Serial.println(accelZ, 4);
    
    int accelX_TX = accelX * 1000;
    int accelY_TX = accelY * 1000;
    int accelZ_TX = accelZ * 1000;

    uint8_t accelXPacket[8] = "AccX:";  // 5-byte ASCII header
    uint8_t accelYPacket[8] = "AccY:";
    uint8_t accelZPacket[8] = "AccZ:";

    accelXPacket[5] = (accelX_TX >> 8)  & 0xFF;  // MSB
    accelXPacket[6] = accelX_TX & 0xFF;          // LSB
    Serial1.write(accelXPacket, 7);            // send 7 bytes total
    delay(100);

    accelYPacket[5] = (accelY_TX >> 8)  & 0xFF;  // MSB
    accelYPacket[6] = accelY_TX & 0xFF;          // LSB
    Serial1.write(accelYPacket, 7);            // send 7 bytes total
    delay(100);

    accelZPacket[5] = (accelZ_TX >> 8)  & 0xFF;  // MSB
    accelZPacket[6] = accelZ_TX & 0xFF;          // LSB
    Serial1.write(accelZPacket, 7);            // send 7 bytes total
    delay(100);

  }
  if(logData){
    appendFile(SD, "/ACCEL.csv", "\n");
    sprintf(dataBuf, "%d, ", accelX);
    appendFile(SD, "/ACCEL.csv", dataBuf);
    sprintf(dataBuf, "%d, ", accelY);
    appendFile(SD, "/ACCEL.csv", dataBuf);
    sprintf(dataBuf, "%d, ", accelZ);
    appendFile(SD, "/ACCEL.csv", dataBuf);
  }
}

void getIMUdata() {
  char dataBuf [20];

  Serial.print("Hello!!!");
  Serial.println(myISM.checkStatus());
	if(myISM.checkStatus() ){
		myISM.getGyro(&gyroData);
    gyroX = gyroData.xData;
    gyroY = gyroData.yData;
    gyroZ = gyroData.zData;

		Serial.print("RotationX: ");
		Serial.println(gyroData.xData);
		Serial.print("RotationY: ");
		Serial.println(gyroData.yData);
		Serial.print("RotationZ: ");
		Serial.println(gyroData.zData);

    Serial1.print("RotationX: ");
		Serial1.println(gyroData.xData);
		Serial1.print("RotationY: ");
		Serial1.println(gyroData.yData);
		Serial1.print("RotationZ: ");
		Serial1.println(gyroData.zData);
	}

  if(logData){
    appendFile(SD, "/ACCEL.csv", "\n");
    sprintf(dataBuf, "%d, ", gyroX);
    appendFile(SD, "/ACCEL.csv", dataBuf);
    sprintf(dataBuf, "%d, ", gyroY);
    appendFile(SD, "/ACCEL.csv", dataBuf);
    sprintf(dataBuf, "%d, ", gyroZ);
    appendFile(SD, "/ACCEL.csv", dataBuf);
  }
}

//////// File System Functions ////////


void writeFile(fs::FS &fs, const char * path, const char * message){ //creates a file in the file system (FS). Imported from SD example

    File file = fs.open(path, FILE_WRITE);
    if(!file){
        Serial.println("Failed to open file for writing");
        return;
    }
    if(file.print(message)){
    } else {
        Serial.println("Write failed");
    }
    file.close();
}

void appendFile(fs::FS &fs, const char * path, const char * message){ //appends a c-string to a file in the FS. Imported from SD example

    File file = fs.open(path, FILE_APPEND);
    if(!file){
        Serial.println("Failed to open file for appending");
        return;
    }
    if(file.print(message)){
    } else {
        Serial.println("Append failed");
    }
    file.close();
}

//////// Debug Functions ////////


void d_list_I2C_devices(){ //Prints out to the serial terminal what devices are found on the I2C bus 
  byte error, address;
  int devices = 0;

  for (address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    error = Wire.endTransmission();
    
    if (error == 0) {
      Serial.print("I2C device found at 0x");
      Serial.println(address, HEX);
      devices++;
    }
  }

  if (devices == 0) {
    Serial.println("No I2C devices found.");
  }
}
