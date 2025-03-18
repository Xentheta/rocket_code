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
  Wire.begin();
  if (atmoSensor1.beginI2C(Wire))
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
  Serial.print("Humidity: ");
  Serial.print(humidity1, 3);
  delay(100);
  Serial.print("Temperature: ");
  Serial.print(temperature1, 3);
  delay(100);
  Serial.print("Pressure: ");
  Serial.print(pressure1, 3);
  delay(100);
  Serial.print("Altitude: ");
  Serial.print(altitude1, 3);
  Serial.println();
  delay(2000);
} 

