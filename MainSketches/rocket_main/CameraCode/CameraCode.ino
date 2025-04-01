#include <SparkFun_MAX1704x_Fuel_Gauge_Arduino_Library.h>

 /*
 XIAO ESP32S3 Sense Camera with Microphone Demo
  xiao-camera-mic-demo.ino
  Tests onboard Camera, MEMS Microphone, and MicroSD Card
  Takes a picture and a 10-second recording when Touch Switch is pressed
  Saves to MicroSD card in JPG & WAV format
  
  DroneBot Workshop 2023
  https://dronebotworkshop.com
*/
 
// Include required libraries
#include <Arduino.h>
#include <esp_camera.h>
#include <FS.h>
#include <SD.h>
#include <SPI.h>
 
// Define camera model & pinout
#define CAMERA_MODEL_XIAO_ESP32S3  // Has PSRAM
#include "camera_pins.h"
 
// Audio record time setting (in seconds, max value 240)
#define RECORD_TIME 10
 
// Camera status variable
bool camera_status = false;
 
// MicroSD status variable
bool sd_status = false;
 
// File Counter
int fileCount = 1;

//number of frames
int numFrames = 30 * 5;

//start boolean
bool startRecording = false;

File file;


int startTime = 0;
int finishTime = 0;
int avgTime = 0;
int times[5];

// Save pictures to SD card
void photo_save(const char *fileName) {
  startTime = micros();
  // Take a photo
  camera_fb_t *fb = esp_camera_fb_get();
  finishTime = micros() - startTime;
  times[0] = times[0] + finishTime;

  if (!fb) {
    Serial.println("Failed to get camera frame buffer");
    return;
  }

  startTime = micros();
  // Save photo to file
  writeFile(SD, fileName, fb->buf, fb->len);
  finishTime = micros() - startTime;
  times[1] = times[1] + finishTime;
 
  startTime = micros();
  // Release image buffer
  esp_camera_fb_return(fb);
  finishTime = micros() - startTime;
  times[2] = times[2] + finishTime;
}
 
// SD card write file
void writeFile(fs::FS &fs, const char *path, uint8_t *data, size_t len) {
  
  if (!file) {
    Serial.println("Failed to open file for writing");
    Serial.println(file);
    return;
  }
  if (file.write(data, len) == len) {
  } else {
    Serial.println("Write failed");
  }
}
 
// Camera Parameters for setup
void CameraParameters() {
  // Define camera parameters
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.frame_size = FRAMESIZE_CIF;
  config.pixel_format = PIXFORMAT_JPEG;
  config.grab_mode = CAMERA_GRAB_LATEST; //TODO- don't know what this does, seems important
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 6;
  config.fb_count = 3;
 
  //if PSRAM IC present, init with UXGA resolution and higher JPEG quality for larger pre-allocated frame buffer.
  if (config.pixel_format == PIXFORMAT_JPEG) {
    if (psramFound()) {
      config.jpeg_quality = 6;
      config.fb_count = 3;
      config.grab_mode = CAMERA_GRAB_LATEST;
    } else {
      // Limit the frame size when PSRAM is not available
      config.frame_size = FRAMESIZE_CIF;
      config.fb_location = CAMERA_FB_IN_DRAM;
    }
  } else {
    // Best option for face detection/recognition
    config.frame_size = FRAMESIZE_240X240;
  #if CONFIG_IDF_TARGET_ESP32S3
      config.fb_count = 3;
  #endif
  }
 
  // Camera init
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }
}
 
void setup() {
  // Start Serial Monitor, wait until port is ready
  Serial.begin(115200);
  while (!Serial)
    ;
 
  // Define Camera Parameters and Initialize
  CameraParameters();
 
  // Camera is good, set status
  camera_status = true;
  Serial.println("Camera OK!");
 
  // Initialize the MicroSD card
  if (!SD.begin(21, SPI, 40000000)) {
    Serial.println("Failed to mount MicroSD Card!");
    while (1)
      ;
  }
 
  // Determine what type of MicroSD card is mounted
  uint8_t cardType = SD.cardType();
 
  if (cardType == CARD_NONE) {
    Serial.println("No MicroSD card inserted!");
    return;
  }
 
  // Print card type
  Serial.print("MicroSD Card Type: ");
  if (cardType == CARD_MMC) {
    Serial.println("MMC");
  } else if (cardType == CARD_SD) {
    Serial.println("SDSC");
  } else if (cardType == CARD_SDHC) {
    Serial.println("SDHC");
  } else {
    Serial.println("UNKNOWN");
  }
  // MicroSD is good, set status
  sd_status = true;

  delay(5000);
  Serial.println("System initialized! Send data on the serial monitor to start recording!");

  while(!startRecording){
    if(Serial.read() != -1){
      startRecording = true;
      serialFlush();
    }
  }
  file = SD.open("/cameraera.based", FILE_APPEND, true);
}

int cameraState = 0;
int cameraTimer = 0;
int curFrames = 0;
char imageFileName[32];
int totTime = 0;
int totFinish = 0;
bool stop = false;
 
void loop() {
  // Make sure the camera and MicroSD are ready
  if (camera_status && sd_status && !stop) {
    totTime = micros();
    switch(cameraState){
      case 0:

        sprintf(imageFileName, "/%d.jpg", fileCount);

        photo_save(imageFileName);
        fileCount++;
        cameraTimer = millis();
        cameraState++;
        break;
      case 1:
        if(millis() - cameraTimer >= 0){
          cameraState = 0;
          curFrames++;

          if(Serial.read() != -1){
            stop = true;
          }

          if(stop){
            Serial.print("Complete! The average time for sector 0 was: ");
            times[0] = times[0] / curFrames;
            Serial.println(times[0]);
            
            Serial.print("Complete! The average time for sector 1 was: ");
            times[1] = times[1] / curFrames;
            Serial.println(times[1]);

            Serial.print("Complete! The average time for sector 2 was: ");
            times[2] = times[2] / curFrames;
            Serial.println(times[2]);

            Serial.print("Complete! The average time for sector 3 was: ");
            times[3] = times[3] / curFrames;
            Serial.println(times[3]);

            Serial.print("Photos taken: ");
            Serial.println(curFrames);

            file.close();
          }
        }
        break;

    }

    totFinish = micros() - totTime;
    times[3] = times[3] + totFinish;
  }
}

void serialFlush(){
  while(Serial.available() > 0) {
    char t = Serial.read();
  }
}
