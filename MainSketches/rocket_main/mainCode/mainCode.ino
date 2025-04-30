//#include <SparkFun_MAX1704x_Fuel_Gauge_Arduino_Library.h>
//#include <SparkFun_KX13X.h>
#include <sfe_bus.h>
#include <SparkFun_u-blox_GNSS_v3.h>
#include <sfe_bus.h>
#include <u-blox_Class_and_ID.h>
#include <u-blox_GNSS.h>
#include <u-blox_config_keys.h>
#include <u-blox_external_typedefs.h>
#include <u-blox_structs.h>
#include <SparkFunBME280.h>
#include <Wire.h>
//#include "FS.h"
#include "SD.h"
#include "SPI.h"


///////////////////////////////////////////////////////////////
//////////////////// Variables & Constants ////////////////////
///////////////////////////////////////////////////////////////


//////// Sensor Objects ////////

BME280 atmoSensor1;
SFE_UBLOX_GNSS myGNSS;
//SFE_MAX1704X lipo(MAX1704X_MAX17048);
//SparkFun_KX132 kxAccel;


//////// global variables ////////

//floats to be used in getting the data from the first BME sensor
float humidity1, temperature1, altitude1, pressure1; 
float humidity2, temperature2, altitude2, pressure2;

//define the pins used for the SPI/SD card interface
int sck = 18;
int miso = 19;
int mosi = 23;
int cs = 5;

// Struct for the accelerometer's data
//outputData myData; 

bool gotAllClear = false;

//////// Constants ////////

//I2C sensor addresses
#define BME1_Sensor_Addr = 0x77
#define BME2_Sensor_Addr = 0x76
#define GNSS_Sensor_Addr = 0x42
#define Battery_Monitor_Addr = 0x36 //uses the MAX17048, which hasn't been implemented in code yet
#define Accel_Sensor_Addr = 0x1F

//////// Debug Flags ////////

#define logData true //change to true to log data to SD card
#define clearFS true //change to true to clean FS on Startup
#define waitForAllClear false //change to true to clean FS on Startup



///////////////////////////////////////////////////////////
//////////////////// Arduino Functions ////////////////////
///////////////////////////////////////////////////////////


void setup() {
  //initialize IO
  Serial.begin(230400);
  Wire.begin(21, 22);

  //initialize sensors
  if (atmoSensor1.beginI2C(Wire) == false)
  {
    Serial.println("Sensor is not responding.");
    while(1);
  }

  while (myGNSS.begin() == false) //Connect to the u-blox module using Wire port
  {
    Serial.println(F("u-blox GNSS not detected at default I2C address. Retrying..."));
    delay (1000);
  }
  myGNSS.setI2COutput(COM_TYPE_UBX);

  /* if (lipo.begin() == false) // Connect to the MAX17043 using the default wire port
  {
    Serial.println(F("MAX17043 not detected. Please check wiring. Freezing."));
    while (1)
      ;
  }
  lipo.quickStart(); // Quick start restarts the MAX17043 in hopes of getting a more accurate guess for the SOC.
  lipo.setThreshold(20); // Set alert threshold to 20%.

  if (!kxAccel.begin(0x1F))
  {
    Serial.println("Could not communicate with the the KX13X. Freezing.");
    while (1)
      ;
  }
  kxAccel.enableAccel(false);
  kxAccel.setRange(SFE_KX132_RANGE16G); // 16g Range 
  kxAccel.enableDataEngine(); // Enables the bit that indicates data is ready.
  kxAccel.enableAccel(); */

  //initialize SD card
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
  /* WriteFile(SD, "/GNSS.csv", "Latitude, longitude, Altitude, ");
  writeFile(SD, "/BNE1.csv", "Humidity, Temp, Pressure, Altitude, ");  
  writeFile(SD, "/BATT.csv", "Voltage, Estimated %, Alert, ");
  writeFile(SD, "/ACCEL.csv", "X Accel, Y Accel, Z Accel, ");

  if(waitForAllClear) //if the system is set to wait for all clear, wait for all clear
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
  }*/
} 

void loop() {
  // getBME1Data(); //Get BME data
  // getGNSSData(); //Get GNSS data
  // getAccelData(); //Get ACCEL data
  // getFuelGaugeData(); //Get Fuel Gauge data

  Serial.print("Hello over there!");

  //debug functions-- uncomment when needed

  // d_list_I2C_devices();

  delay(1000);
} 


//////////////////////////////////////////////////////////
//////////////////// Custom Functions ////////////////////
//////////////////////////////////////////////////////////


//////// Sensor Functions ////////


void getBME1Data(){ //prints the data for the first BME sensor. Can also log data to SD if enabled 
  char dataBuf [20];

  // Get humidity, temp, pressure, altitude
  humidity1 = atmoSensor1.readFloatHumidity();
  temperature1 = atmoSensor1.readTempF();
  pressure1 = atmoSensor1.readFloatPressure();
  altitude1 = atmoSensor1.readFloatAltitudeFeet();
  Serial.print("Humidity: ");
  Serial.println(humidity1, 3);
  Serial.print("Temperature: ");
  Serial.println(temperature1, 3);
  Serial.print("Pressure: ");
  Serial.println(pressure1, 3);
  Serial.print("Altitude: ");
  Serial.println(altitude1, 3);
  Serial.println("\n");

  int humididy2 = humidity1 * 1000;
  int temperature2 = temperature1 * 1000;
  int pressure2 = pressure1 * 1000;
  int altitude2 = altitude1 * 1000;

  if(logData){
      appendFile(SD, "/BNE1.csv", "\n");
      sprintf(dataBuf, "%d, ", humididy2);
      appendFile(SD, "/BNE1.csv", dataBuf);
      sprintf(dataBuf, "%d, ", temperature2);
      appendFile(SD, "/BNE1.csv", dataBuf);
      sprintf(dataBuf, "%d, ", pressure2);
      appendFile(SD, "/BNE1.csv", dataBuf);
      sprintf(dataBuf, "%d, ", altitude2);
      appendFile(SD, "/BNE1.csv", dataBuf);
    }
}

void getGNSSData(){  //prints the data for the GNSS sensor. Can also log data to SD if enabled 
  char dataBuf [20];

  if (myGNSS.getPVT() == true)
  {
    int32_t latitude = myGNSS.getLatitude();
    Serial.print(F("Lat: "));
    Serial.print(latitude);

    int32_t longitude = myGNSS.getLongitude();
    Serial.print(F(" Long: "));
    Serial.print(longitude);
    Serial.print(F(" (degrees * 10^-7)"));

    int32_t altitude = myGNSS.getAltitudeMSL(); // Altitude above Mean Sea Level
    Serial.print(F(" Alt: "));
    Serial.print(altitude);
    Serial.print(F(" (mm)"));

    Serial.println();

    if(logData){
      appendFile(SD, "/GNSS.csv", "\n");
      sprintf(dataBuf, "%d, ", latitude);
      appendFile(SD, "/GNSS.csv", dataBuf);
      sprintf(dataBuf, "%d, ", longitude);
      appendFile(SD, "/GNSS.csv", dataBuf);
      sprintf(dataBuf, "%d, ", altitude);
      appendFile(SD, "/GNSS.csv", dataBuf);
    }
  }
}

void getFuelGaugeData(){
  char dataBuf [20];

  int voltage = lipo.getVoltage();
  // lipo.getSOC() returns the estimated state of charge (e.g. 79%)
  int soc = lipo.getSOC();
  // lipo.getAlert() returns a 0 or 1 (0=alert not triggered)
  bool alert = lipo.getAlert();

  Serial.print("Battery voltage (V * 100): ");
  Serial.println(voltage * 100);
  Serial.print("Battery voltage (% * 100): ");
  Serial.println(soc * 100);
  Serial.print("Battery warning: ");
  Serial.println(alert);

  if(logData){
      appendFile(SD, "/BATT.csv", "\n");
      sprintf(dataBuf, "%d, ", voltage);
      appendFile(SD, "/BATT.csv", dataBuf);
      sprintf(dataBuf, "%d, ", soc);
      appendFile(SD, "/BATT.csv", dataBuf);
      sprintf(dataBuf, "%d, ", alert);
      appendFile(SD, "/BATT.csv", dataBuf);
    }
}

void getAccelData(){
  char dataBuf [20];
  
  if (kxAccel.dataReady())
  {
    kxAccel.getAccelData(&myData);
    Serial.print("X: ");
    Serial.print(myData.xData, 4);
    Serial.print("Y: ");
    Serial.print(myData.yData, 4);
    Serial.print(" Z: ");
    Serial.print(myData.zData, 4);
    Serial.println();
  }

  if(logData){
      appendFile(SD, "/ACCEL.csv", "\n");
      sprintf(dataBuf, "%d, ", myData.xData * 1000);
      appendFile(SD, "/ACCEL.csv", dataBuf);
      sprintf(dataBuf, "%d, ", myData.yData * 1000);
      appendFile(SD, "/ACCEL.csv", dataBuf);
      sprintf(dataBuf, "%d, ", myData.zData * 1000);
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


//////// General Todos ////////


//standardize comments and/or make code more readable. Possibly even move differnet sections to seperate classes/files

//implement reset protection for all_clear

//fix my dumbass spelling mistakes
