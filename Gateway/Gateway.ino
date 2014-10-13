#include <Bridge.h>
#include <YunServer.h>
#include <YunClient.h>
#include <Wire.h>
#include <Adafruit_NFCShield_I2C.h>
#include <SimpleTimer.h>

//---------------------------------------------- NFC
#define IRQ   (6)
#define RESET (7)  // Not connected by default on the NFC Shield

Adafruit_NFCShield_I2C nfc(IRQ, RESET);

bool shieldOK = false;

#define NOT_FOUND 0
#define MIFARE_CLASSIC 4
#define MIFARE_ULTRA 7

uint8_t uid[7];
uint8_t uidLength;
String uidString = "";
String uidString_last = "";

//---------------------------------------------- communication to the Bridge
SimpleTimer timer;
YunServer server;

Process askPermissionProcess;
Process notifyServerProcess;

//---------------------------------------------- door tick
bool tick = false;
int tickled = 5;

//---------------------------------------------- setup
void setup(void) {
  delay(2000);      // we're lazy

  Serial.begin(115200);

  Serial.println(F("Bridge"));
  Bridge.begin();
  delay(1000);

  Serial.println(F("YunServer"));
  server.listenOnLocalhost();
  server.begin();
  delay(1000);

  setupNFC();

  Serial.println(F("Pins"));
  // pin modes
  pinMode(tickled, OUTPUT);
  analogWrite(tickled, 0);

  timer.setInterval(60000, notifyServer);

  Serial.println(F("."));
}

//---------------------------------------------- loop
void loop(void) {
  // try to read a new NFC tag
  if (shieldOK) {
    readNFC();
    delay(100);
  }

  // accept connection from server that ask if a tag is present and respond with the current UID
  serveIncomingRequest();

  // periodically notify the server
  timer.run();

  // if the door has to be opened tick the relay
  tickTheDoor();
}

//---------------------------------------------- door tick
unsigned long tick_prevMillis = 0;
const long tick_interval = 1000;

void doTheCheckIn() {
  tick = true;
  tick_prevMillis = millis();
}

void tickTheDoor() {
  if (tick == false) {
    digitalWrite(tickled, LOW);
    return;
  }
  digitalWrite(tickled, HIGH);

  unsigned long tick_currentMillis = millis();
  if (tick_currentMillis - tick_prevMillis >= tick_interval) {
    tick_prevMillis = tick_currentMillis;
    tick = false;
    Serial.println("tick closed");
  } else {

  }
}

void doTheCheckInServo() {

  Serial.println("move the servo");
  analogWrite(tickled, 160);  
  delay(1500);
  
  analogWrite(tickled, 10);
  
  Serial.println("end move the servo");
}

//---------------------------------------------- utils

void uid_array2string2(String &s, const byte * pin, const uint8_t numBytes) {
  s = "_";
  const char * hex = "0123456789ABCDEF";
  int i = 0;
  for (; i < numBytes - 1; ++i) {
    s += hex[(*pin >> 4) & 0xF];
    s += hex[(*pin++) & 0xF];
    s += '_';
  }
  s += hex[(*pin >> 4) & 0xF];
  s += hex[(*pin++) & 0xF];
}

String getTrimValue(const String &data, char separator, int index)
{
  // from http://stackoverflow.com/questions/9072320/split-string-into-string-array
  int found = 0;
  int strIndex[] = {0, -1};
  int maxIndex = data.length() - 1;

  for (int i = 0; i <= maxIndex && found <= index; i++) {
    if (data.charAt(i) == separator || i == maxIndex) {
      found++;
      strIndex[0] = strIndex[1] + 1;
      strIndex[1] = (i == maxIndex) ? i + 1 : i;
    }
  }

  return found > index ? data.substring(strIndex[0], strIndex[1]) : "";
}