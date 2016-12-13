// Inspired from https://www.arduino.cc/en/Tutorial/WebClientRepeating

// Poll honeybeacon server every 30s (request includes deviceUUID)
// Turn on light beacon when faults is found

#include <string.h>
#include <SPI.h>
#include <Ethernet.h>

// Map const to pin
int RELAY_1 = 8;

// assign a MAC address for the ethernet controller.
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };

// initialize the Ethernet client library
EthernetClient client;
byte ip[] = { 192, 168, 144, 177 };

char server[] = "honeybeacon.herokuapp.com";

unsigned long lastConnectionTime = 0;
const unsigned long pollingInterval = 30L * 1000L;

const String deviceUUID = String("39b43bda82ea4391b9f26e57934cce32");

void setup() {
  pinMode(RELAY_1, OUTPUT);

  Serial.begin(9600);
  // wait for serial port to connect. Needed for native USB port only
  while (!Serial) { }

  Serial.println("initializing ethernet");
  // give the ethernet module time to boot up:
  delay(1000);
  if (Ethernet.begin(mac) == 0) {
    Serial.println("Failed to configure Ethernet using DHCP");
    Ethernet.begin(mac, ip);
  }
  Serial.print("My IP Address: ");
  Serial.println(Ethernet.localIP());
  digitalWrite(RELAY_1, HIGH);
}

void loop() {
  // if there are incoming bytes available
  // from the server, read them
  int available = client.available();
  if (available) {

    char c = client.read();
    // use last response body character
    if (available == 2) {
      handleResponse(c);
    }
    Serial.write(c);
  }

  if (millis() - lastConnectionTime > pollingInterval) {
    httpRequest();
  }
}

void handleResponse(char c) {
  switch (c) {
    case '0':
      Serial.println("No faults. All good");
      break;
    case '1':
      Serial.println("Faults found. Start beacon");
      faultsPatternBeacon();
      break;
    case '2':
      Serial.println("Test beacon");
      testPatternBeacon();
      break;
    default:
      Serial.print("Don't know how to handle control character: ");
      Serial.println(c);
      break;
  }
}

void faultsPatternBeacon() {
  digitalWrite(RELAY_1, LOW);
  delay(5000);
  digitalWrite(RELAY_1, HIGH);
}

void testPatternBeacon() {
  for (int i=0; i <= 5; i++){
    digitalWrite(RELAY_1, LOW);
    delay(500);
    digitalWrite(RELAY_1, HIGH);
    delay(500);
  }
}

void httpRequest() {
  Serial.println("disconnecting.");
  client.stop();

  // if there's a successful connection:
  if (client.connect(server, 80)) {
    Serial.println("connecting...");
    // send the HTTP GET request:
    String requestLine = String("GET /faults?deviceId=") + deviceUUID + " HTTP/1.1";
    client.println(requestLine);
    client.println("Host: honeybeacon.herokuapp.com");
    client.println("User-Agent: honeydevice");
    client.println("Connection: close");
    client.println();

    // note the time that the connection was made:
    lastConnectionTime = millis();
  } else {
    // if you couldn't make a connection:
    Serial.println("connection failed");
  }
}
