
float lat = 31.9973;
float lon = -102.0779;
float prev_lat = 0;
float prev_long = 0;


void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);

}

void loop() {
  // put your main code here, to run repeatedly:

  Serial.println("Latitude: " + String(lat, 4));
  prev_lat = lat;

  delay(1000);

  Serial.println("Longitude: " + String(lon, 4));
  prev_long = lon;

  delay(1000);

}
