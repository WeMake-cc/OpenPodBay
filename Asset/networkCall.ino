void serveIncomingRequest() {
  YunClient client = server.accept();
  if (client) {
    String url = client.readString();
    String command = getTrimValue(url, '/', 0);
    Serial.println(F("incoming connection"));
    Serial.println(command);
    command.trim();
    
    // command to move the arduino in STATUS_RESERVED mode
    if(command == "reserved") {
      String timeString = getTrimValue(url, '/', 1);
      char tarray[100]; 
      timeString.toCharArray(tarray, sizeof(tarray));
      time_to_be_reserved = millis() + atol(tarray)*1000;
      _status = STATUS_RESERVED;
      
    }
    client.stop();
    Serial.println(F("connection closed"));
    
  }
  delay(50);
}

void askPermission() {
  Serial.println(F("askPermission: "));  
  
  askPermissionProcess.begin(F("python"));
  askPermissionProcess.addParameter(F("/root/askPermission.py"));
  askPermissionProcess.addParameter(uidString);
  askPermissionProcess.run();

  const int COMMAND_NONE = 0;
  const int COMMAND_N = 1;
  const int COMMAND_Y = 2;

  int command = COMMAND_NONE;
  int d = 0;
  String timeString = "";

  Serial.println("answer:");
  while (askPermissionProcess.available()>0) {
    char c = askPermissionProcess.read();
    
    if(command==COMMAND_N) {
      // just debug
      Serial.print(c);
    } else if(command==COMMAND_Y) {
      timeString += c;
    }
    
    if(command==COMMAND_NONE && c=='n') {
      Serial.println("N");
      command = COMMAND_N;
      displayAccessDenied();
    } else if(command==COMMAND_NONE && c=='y') {
      Serial.println("Y");
      command = COMMAND_Y;
    }
  }
  
  if(command==COMMAND_Y) {
    reservation_active = true;
  }
  
  Serial.flush();
  Serial.println();
}

void notifyServer() {
  notifyServerProcess.begin(F("python"));
  notifyServerProcess.addParameter(F("/root/notifyStatus.py"));
  if(shieldOK) notifyServerProcess.addParameter("8");
  else notifyServerProcess.addParameter("2");
  notifyServerProcess.run();

  Serial.println(F("notifyStatus: "));  
  while (notifyServerProcess.available()>0) {
    char c = notifyServerProcess.read();
    Serial.print(c);
  }
  Serial.flush();
  Serial.println();
}