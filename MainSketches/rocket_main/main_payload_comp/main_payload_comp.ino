#include <SparkFun_u-blox_GNSS_v3.h>
#include <sfe_bus.h>
#include <u-blox_Class_and_ID.h>
#include <u-blox_GNSS.h>
#include <u-blox_config_keys.h>
#include <u-blox_external_typedefs.h>
#include <u-blox_structs.h>
#include <SparkFunBME280.h>
#include <Wire.h>

BME280 atmoSensor1;

float humidity1, temperature1, altitude1, pressure1;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  if (atmoSensor1.beginI2C(Wire) == false)
  {
    Serial.println("Sensor is not responding.");
    while(1);
  }
}

void loop() {
  humidity1 = atmoSensor1.readFloatHumidity();
  temperature1 = atmoSensor1.readTempF();
  pressure1 = atmoSensor1.readFloatPressure();
  altitude1 = atmoSensor1.readFloatAltitudeFeet();
  Serial.println("Humidity: ");
  Serial.print(humidity1, 3);
  delay(100);
  Serial.println("Temperature: ");
  Serial.print(temperature1, 3);
  delay(100);
  Serial.println("Pressure: ");
  Serial.print(pressure1, 3);
  delay(100);
  Serial.println("Altitude: ");
  Serial.print(altitude1, 3);
  delay(2000);
} 

/*#include <Wire.h>

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22); // Use GPIO 21 (SDA) and GPIO 22 (SCL)
  Serial.println("Scanning for I2C devices...");
}

void loop() {
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
  
  delay(5000);
} */


