# SapSense IoT Prototype Setup Guide

Complete guide for setting up the SapSense coconut sap monitoring prototype with pH sensor, Temperature sensor, and Ultrasonic sensor using ESP32/ESP8266, integrated with a Raspberry Pi server and PostgreSQL database.

---

## Table of Contents

1. [Hardware Requirements](#1-hardware-requirements)
2. [Sensor Specifications & Wiring](#2-sensor-specifications--wiring)
3. [ESP32/ESP8266 Setup & Code](#3-esp32esp8266-setup--code)
4. [Raspberry Pi Server Setup](#4-raspberry-pi-server-setup)
5. [PostgreSQL Database Setup](#5-postgresql-database-setup)
6. [API Endpoints Reference](#6-api-endpoints-reference)
7. [Testing & Calibration](#7-testing--calibration)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Hardware Requirements

### Microcontroller (Choose One)
| Component | Model | Purpose |
|-----------|-------|---------|
| ESP32 | ESP32-WROOM-32 (Recommended) | WiFi + processing power |
| ESP8266 | NodeMCU v3 | Budget option |

### Sensors
| Sensor | Model | Purpose | Output |
|--------|-------|---------|--------|
| pH Sensor | DFRobot SEN0161 or PH-4502C | Measures sap acidity (5.0-5.5 optimal) | Analog 0-5V |
| Temperature Sensor | DS18B20 (Waterproof) | Monitors sap temperature | Digital (OneWire) |
| Ultrasonic Sensor | HC-SR04 or JSN-SR04T (Waterproof) | Measures liquid level for volume calculation | Digital (Trigger/Echo) |

### Power & Accessories
| Item | Specification | Notes |
|------|---------------|-------|
| Power Supply | 5V 2A USB or 18650 Battery | For ESP32 |
| Battery Module | TP4056 | For solar/battery operation |
| Breadboard/PCB | Standard | For prototyping |
| Jumper Wires | Male-Male, Male-Female | Various lengths |
| Waterproof Enclosure | IP65 or better | For outdoor use |

### Server
| Component | Specification |
|-----------|---------------|
| Raspberry Pi | Model 4B (2GB+ RAM recommended) |
| MicroSD Card | 32GB+ Class 10 |
| Power Supply | Official 5V 3A USB-C |
| Ethernet Cable | Cat5e or better (optional) |

---

## 2. Sensor Specifications & Wiring

### 2.1 pH Sensor (PH-4502C / DFRobot SEN0161)

**Pin Connections to ESP32:**
```
PH-4502C Module    →    ESP32
─────────────────────────────
VCC                →    3.3V (or 5V if module supports)
GND                →    GND
Po (Analog Out)    →    GPIO34 (Analog ADC1)
To (Temp Out)      →    Not used (we use separate DS18B20)
```

**Pin Connections to ESP8266:**
```
PH-4502C Module    →    ESP8266 (NodeMCU)
─────────────────────────────────────────
VCC                →    3.3V
GND                →    GND
Po (Analog Out)    →    A0 (Only analog pin)
```

**Important Notes:**
- Calibrate using pH 4.0 and pH 7.0 buffer solutions
- Keep probe wet when not in use (store in KCl solution)
- pH range for coconut sap: 5.0-5.5 (optimal), 4.8-7.2 (acceptable)

### 2.2 Temperature Sensor (DS18B20)

**Pin Connections:**
```
DS18B20 (Waterproof)    →    ESP32
──────────────────────────────────
Red (VCC)               →    3.3V
Black (GND)             →    GND
Yellow (Data)           →    GPIO4
                             + 4.7kΩ resistor between Data and VCC
```

**Important Notes:**
- Use 4.7kΩ pull-up resistor between Data and VCC
- Waterproof version ideal for liquid immersion
- Operating range: -55°C to +125°C

### 2.3 Ultrasonic Sensor (HC-SR04 / JSN-SR04T)

**Pin Connections:**
```
HC-SR04              →    ESP32
────────────────────────────────
VCC                  →    5V (HC-SR04 needs 5V)
GND                  →    GND
TRIG                 →    GPIO5
ECHO                 →    GPIO18 (use voltage divider for ESP32!)
```

**Voltage Divider for ECHO Pin (5V to 3.3V):**
```
ECHO Pin ──┬── 1kΩ ──── GPIO18 (ESP32)
           │
          2kΩ
           │
          GND
```

**Volume Calculation Formula:**
```
Distance (cm) = (Duration × 0.034) / 2

Container Volume Calculation:
─────────────────────────────
Given:
  - Container Height (H) = 30 cm
  - Container Radius (r) = 10 cm
  - Sensor Distance from top = 5 cm
  - Measured Distance = d cm

Liquid Height = H - sensor_offset - d
Liquid Volume (Liters) = π × r² × Liquid Height / 1000
```

### 2.4 Complete Wiring Diagram (ESP32)

```
                    ┌─────────────────────────────────────┐
                    │           ESP32-WROOM-32            │
                    │                                     │
    pH Sensor Po ───┤ GPIO34 (ADC)                       │
                    │                                     │
   DS18B20 Data ────┤ GPIO4                    GPIO5 ────┼─── HC-SR04 TRIG
        │           │                                     │
      4.7kΩ         │                          GPIO18 ───┼─── HC-SR04 ECHO
        │           │                             │       │    (via voltage divider)
       3.3V         │                           1kΩ       │
                    │                             │       │
                    │                           2kΩ       │
                    │                             │       │
          3.3V ─────┤ 3V3                        GND      │
                    │                                     │
          GND ──────┤ GND                                 │
                    │                                     │
           5V ──────┤ VIN ──────────────────── HC-SR04 VCC│
                    │                                     │
                    └─────────────────────────────────────┘
```

---

## 3. ESP32/ESP8266 Setup & Code

### 3.1 Arduino IDE Setup

1. **Install Arduino IDE** (v2.0+): https://www.arduino.cc/en/software

2. **Add ESP32/ESP8266 Board Support:**
   - Go to `File → Preferences`
   - Add to "Additional Board Manager URLs":
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   https://arduino.esp8266.com/stable/package_esp8266com_index.json
   ```
   - Go to `Tools → Board → Board Manager`
   - Search and install "ESP32" or "ESP8266"

3. **Install Required Libraries:**
   - `OneWire` - For DS18B20
   - `DallasTemperature` - For DS18B20
   - `ArduinoJson` - For JSON formatting
   - `WiFi` (ESP32) or `ESP8266WiFi` (ESP8266)
   - `HTTPClient`

### 3.2 ESP32 Arduino Code

Create a new Arduino sketch and paste the following code:

```cpp
/*
 * SapSense Prototype - ESP32 Sensor Node
 * Reads pH, Temperature, and Ultrasonic sensors
 * Sends data to Raspberry Pi server via WiFi
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// ==================== CONFIGURATION ====================

// WiFi Credentials
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Server Configuration (Raspberry Pi)
const char* SERVER_URL = "http://192.168.1.100:3001";  // Change to your Pi's IP
const char* TREE_ID = "tree-1739349600000";            // Your registered tree ID

// Pin Definitions
#define PH_SENSOR_PIN       34    // Analog pin for pH sensor
#define TEMP_SENSOR_PIN     4     // Digital pin for DS18B20
#define ULTRASONIC_TRIG     5     // Trigger pin for HC-SR04
#define ULTRASONIC_ECHO     18    // Echo pin for HC-SR04

// Container Configuration (adjust to your container)
const float CONTAINER_HEIGHT_CM = 30.0;      // Total container height in cm
const float CONTAINER_RADIUS_CM = 10.0;      // Container radius in cm
const float SENSOR_OFFSET_CM = 5.0;          // Distance from sensor to container top

// pH Calibration Values (calibrate with buffer solutions)
const float PH_OFFSET = 0.00;                // Offset adjustment
const float PH_SLOPE = -5.70;                // Slope from calibration

// Timing
const unsigned long SEND_INTERVAL = 30000;   // Send data every 30 seconds
const unsigned long SENSOR_WARMUP = 2000;    // Sensor warmup time

// ==================== OBJECTS ====================

OneWire oneWire(TEMP_SENSOR_PIN);
DallasTemperature tempSensor(&oneWire);

// ==================== VARIABLES ====================

unsigned long lastSendTime = 0;
float batteryLevel = 100.0;  // Placeholder for battery monitoring

// ==================== SETUP ====================

void setup() {
  Serial.begin(115200);
  Serial.println("\n=== SapSense Prototype Starting ===");
  
  // Initialize pins
  pinMode(ULTRASONIC_TRIG, OUTPUT);
  pinMode(ULTRASONIC_ECHO, INPUT);
  
  // Initialize temperature sensor
  tempSensor.begin();
  
  // Connect to WiFi
  connectWiFi();
  
  // Warm up sensors
  Serial.println("Warming up sensors...");
  delay(SENSOR_WARMUP);
  
  Serial.println("=== Prototype Ready ===\n");
}

// ==================== MAIN LOOP ====================

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }
  
  // Send data at specified interval
  if (millis() - lastSendTime >= SEND_INTERVAL) {
    // Read all sensors
    float phValue = readPH();
    float temperature = readTemperature();
    float distance = readUltrasonic();
    float volume = calculateVolume(distance);
    
    // Print readings
    Serial.println("--- Sensor Readings ---");
    Serial.printf("pH: %.2f\n", phValue);
    Serial.printf("Temperature: %.2f °C\n", temperature);
    Serial.printf("Distance: %.2f cm\n", distance);
    Serial.printf("Volume: %.2f Liters\n", volume);
    Serial.println("-----------------------\n");
    
    // Send to server
    sendSensorData(phValue, volume, temperature);
    
    lastSendTime = millis();
  }
  
  delay(100);
}

// ==================== WIFI FUNCTIONS ====================

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi Connection Failed!");
  }
}

// ==================== SENSOR READING FUNCTIONS ====================

float readPH() {
  // Take multiple readings and average
  const int SAMPLES = 10;
  float total = 0;
  
  for (int i = 0; i < SAMPLES; i++) {
    total += analogRead(PH_SENSOR_PIN);
    delay(10);
  }
  
  float avgReading = total / SAMPLES;
  
  // Convert analog reading to voltage (ESP32 has 12-bit ADC, 0-4095)
  float voltage = avgReading * (3.3 / 4095.0);
  
  // Convert voltage to pH value
  // Formula: pH = 7 + ((2.5 - voltage) / slope)
  // Adjust based on your calibration
  float phValue = 7.0 + ((2.5 - voltage) * PH_SLOPE) + PH_OFFSET;
  
  // Constrain to valid pH range
  phValue = constrain(phValue, 0.0, 14.0);
  
  return phValue;
}

float readTemperature() {
  tempSensor.requestTemperatures();
  float temperature = tempSensor.getTempCByIndex(0);
  
  // Check for sensor error
  if (temperature == DEVICE_DISCONNECTED_C) {
    Serial.println("Temperature sensor error!");
    return 25.0;  // Return default value
  }
  
  return temperature;
}

float readUltrasonic() {
  // Clear trigger
  digitalWrite(ULTRASONIC_TRIG, LOW);
  delayMicroseconds(2);
  
  // Send 10µs pulse
  digitalWrite(ULTRASONIC_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(ULTRASONIC_TRIG, LOW);
  
  // Read echo pulse duration
  long duration = pulseIn(ULTRASONIC_ECHO, HIGH, 30000);  // 30ms timeout
  
  // Calculate distance in cm
  float distance = (duration * 0.034) / 2.0;
  
  // Validate reading
  if (distance <= 0 || distance > 400) {
    Serial.println("Ultrasonic sensor error!");
    return 0;
  }
  
  return distance;
}

float calculateVolume(float distance) {
  // Calculate liquid height
  float liquidHeight = CONTAINER_HEIGHT_CM - SENSOR_OFFSET_CM - distance;
  
  // Ensure non-negative height
  if (liquidHeight < 0) liquidHeight = 0;
  
  // Calculate volume in cubic centimeters (π × r² × h)
  float volumeCm3 = 3.14159 * CONTAINER_RADIUS_CM * CONTAINER_RADIUS_CM * liquidHeight;
  
  // Convert to liters (1 liter = 1000 cm³)
  float volumeLiters = volumeCm3 / 1000.0;
  
  return volumeLiters;
}

// ==================== HTTP FUNCTIONS ====================

void sendSensorData(float ph, float volume, float temperature) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected. Cannot send data.");
    return;
  }
  
  HTTPClient http;
  
  // Build the endpoint URL
  String url = String(SERVER_URL) + "/api/trees/" + TREE_ID + "/sensor-data";
  
  Serial.print("Sending data to: ");
  Serial.println(url);
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload
  StaticJsonDocument<256> doc;
  doc["ph"] = round(ph * 100) / 100.0;
  doc["volume"] = round(volume * 100) / 100.0;
  doc["temperature"] = round(temperature * 100) / 100.0;
  doc["humidity"] = 70.0;  // Placeholder (add humidity sensor if needed)
  doc["battery_level"] = batteryLevel;
  doc["latitude"] = 0.0;   // Add GPS module if needed
  doc["longitude"] = 0.0;
  
  String jsonPayload;
  serializeJson(doc, jsonPayload);
  
  Serial.print("Payload: ");
  Serial.println(jsonPayload);
  
  // Send POST request
  int httpResponseCode = http.POST(jsonPayload);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("Response Code: ");
    Serial.println(httpResponseCode);
    Serial.print("Response: ");
    Serial.println(response);
  } else {
    Serial.print("HTTP Error: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}
```

### 3.3 ESP8266 Arduino Code (If Using NodeMCU)

```cpp
/*
 * SapSense Prototype - ESP8266 Sensor Node
 * Modified version for NodeMCU/ESP8266
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// ==================== CONFIGURATION ====================

const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* SERVER_URL = "http://192.168.1.100:3001";
const char* TREE_ID = "tree-1739349600000";

// Pin Definitions (ESP8266)
#define PH_SENSOR_PIN       A0    // Only analog pin on ESP8266
#define TEMP_SENSOR_PIN     D4    // GPIO2
#define ULTRASONIC_TRIG     D1    // GPIO5
#define ULTRASONIC_ECHO     D2    // GPIO4

// Container Configuration
const float CONTAINER_HEIGHT_CM = 30.0;
const float CONTAINER_RADIUS_CM = 10.0;
const float SENSOR_OFFSET_CM = 5.0;

// pH Calibration
const float PH_OFFSET = 0.00;
const float PH_SLOPE = -5.70;

const unsigned long SEND_INTERVAL = 30000;

OneWire oneWire(TEMP_SENSOR_PIN);
DallasTemperature tempSensor(&oneWire);
WiFiClient wifiClient;

unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(115200);
  Serial.println("\n=== SapSense ESP8266 Starting ===");
  
  pinMode(ULTRASONIC_TRIG, OUTPUT);
  pinMode(ULTRASONIC_ECHO, INPUT);
  
  tempSensor.begin();
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected! IP: " + WiFi.localIP().toString());
}

void loop() {
  if (millis() - lastSendTime >= SEND_INTERVAL) {
    float phValue = readPH();
    float temperature = readTemperature();
    float distance = readUltrasonic();
    float volume = calculateVolume(distance);
    
    Serial.printf("pH: %.2f, Temp: %.2f°C, Vol: %.2fL\n", phValue, temperature, volume);
    
    sendSensorData(phValue, volume, temperature);
    lastSendTime = millis();
  }
  delay(100);
}

float readPH() {
  int total = 0;
  for (int i = 0; i < 10; i++) {
    total += analogRead(PH_SENSOR_PIN);
    delay(10);
  }
  float avgReading = total / 10.0;
  float voltage = avgReading * (3.3 / 1023.0);  // ESP8266 has 10-bit ADC
  float phValue = 7.0 + ((2.5 - voltage) * PH_SLOPE) + PH_OFFSET;
  return constrain(phValue, 0.0, 14.0);
}

float readTemperature() {
  tempSensor.requestTemperatures();
  return tempSensor.getTempCByIndex(0);
}

float readUltrasonic() {
  digitalWrite(ULTRASONIC_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(ULTRASONIC_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(ULTRASONIC_TRIG, LOW);
  long duration = pulseIn(ULTRASONIC_ECHO, HIGH, 30000);
  return (duration * 0.034) / 2.0;
}

float calculateVolume(float distance) {
  float liquidHeight = CONTAINER_HEIGHT_CM - SENSOR_OFFSET_CM - distance;
  if (liquidHeight < 0) liquidHeight = 0;
  float volumeCm3 = 3.14159 * CONTAINER_RADIUS_CM * CONTAINER_RADIUS_CM * liquidHeight;
  return volumeCm3 / 1000.0;
}

void sendSensorData(float ph, float volume, float temperature) {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  String url = String(SERVER_URL) + "/api/trees/" + TREE_ID + "/sensor-data";
  
  http.begin(wifiClient, url);
  http.addHeader("Content-Type", "application/json");
  
  StaticJsonDocument<256> doc;
  doc["ph"] = ph;
  doc["volume"] = volume;
  doc["temperature"] = temperature;
  doc["humidity"] = 70.0;
  doc["battery_level"] = 100.0;
  
  String jsonPayload;
  serializeJson(doc, jsonPayload);
  
  int responseCode = http.POST(jsonPayload);
  Serial.printf("HTTP Response: %d\n", responseCode);
  
  http.end();
}
```

---

## 4. Raspberry Pi Server Setup

### 4.1 Initial Raspberry Pi Setup

1. **Flash Raspberry Pi OS:**
   - Download Raspberry Pi Imager: https://www.raspberrypi.com/software/
   - Flash "Raspberry Pi OS (64-bit)" to SD card
   - Enable SSH during setup

2. **First Boot Configuration:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Set hostname
   sudo hostnamectl set-hostname sapsense-server
   
   # Set static IP (optional but recommended)
   sudo nano /etc/dhcpcd.conf
   ```
   
   Add to dhcpcd.conf:
   ```
   interface eth0
   static ip_address=192.168.1.100/24
   static routers=192.168.1.1
   static domain_name_servers=192.168.1.1 8.8.8.8
   ```

3. **Reboot:**
   ```bash
   sudo reboot
   ```

### 4.2 Install Node.js

```bash
# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version    # Should show v18.x.x
npm --version     # Should show 9.x.x or higher
```

### 4.3 Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
psql --version
```

### 4.4 Configure PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell, run:
```
```sql
-- Create database
CREATE DATABASE sapsense_db;

-- Create user
CREATE USER sapsense_user WITH ENCRYPTED PASSWORD 'sapsense123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE sapsense_db TO sapsense_user;

-- Connect to the database
\c sapsense_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO sapsense_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sapsense_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sapsense_user;

-- Exit
\q
```

```bash
# Configure PostgreSQL to accept connections
sudo nano /etc/postgresql/15/main/postgresql.conf
```

Find and modify:
```
listen_addresses = '*'
```

```bash
# Configure client authentication
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

Add this line:
```
host    all    all    0.0.0.0/0    md5
```

```bash
# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 4.5 Deploy SapSense Server

```bash
# Create application directory
mkdir -p ~/sapsense
cd ~/sapsense

# Clone or copy your server files
# Option 1: From Git (if you have a repo)
# git clone https://github.com/your-repo/sapsense-server.git .

# Option 2: Copy files manually via SCP from your computer
# scp -r ./server/* pi@192.168.1.100:~/sapsense/
```

After copying files:

```bash
cd ~/sapsense

# Install dependencies
npm install

# Create environment file
nano .env
```

Add to .env:
```bash
# Database Settings
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sapsense_db
DB_USER=sapsense_user
DB_PASSWORD=sapsense123

# Server Settings
PORT=3001
NODE_ENV=production

# JWT Secret
JWT_SECRET=your-super-secret-key-change-this
```

```bash
# Setup database tables
npm run db:setup

# Seed sample data (optional)
npm run db:seed

# Start the server
npm start
```

### 4.6 Run Server as a Service (Auto-start on Boot)

```bash
# Install PM2 (Process Manager)
sudo npm install -g pm2

# Start server with PM2
pm2 start src/index.js --name sapsense-server

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
# Follow the instructions printed by this command

# Check status
pm2 status
pm2 logs sapsense-server
```

### 4.7 Firewall Configuration

```bash
# Install UFW (if not installed)
sudo apt install -y ufw

# Allow SSH
sudo ufw allow ssh

# Allow API port
sudo ufw allow 3001

# Allow PostgreSQL (only if remote access needed)
sudo ufw allow 5432

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## 5. PostgreSQL Database Setup

### 5.1 Database Schema

The following tables are automatically created when you run `npm run db:setup`:

**Main Tables:**

| Table | Purpose |
|-------|---------|
| `users` | Admin and farmer accounts |
| `employees` | Employee/farmer details |
| `tree_containers` | Registered prototypes/trees |
| `harvest` | Harvest records |
| `notifications` | System alerts |
| `settings` | System configuration |

**Dynamic Sensor Tables:**
- Each registered tree gets its own sensor data table: `sensor_data_{tree_id}`

### 5.2 Key Table Schemas

**tree_containers table:**
```sql
CREATE TABLE tree_containers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    location VARCHAR(100),
    assigned_farmer_id VARCHAR(50),
    assigned_farmer_name VARCHAR(100),
    current_ph DECIMAL(4,2),           -- Latest pH reading
    current_volume DECIMAL(10,2),       -- Current volume in liters
    current_temperature DECIMAL(5,2),   -- Latest temperature
    status VARCHAR(20),                 -- optimal/warning/critical/harvest
    last_reading TIMESTAMP,
    created_at TIMESTAMP
);
```

**sensor_data_{tree_id} table (created per tree):**
```sql
CREATE TABLE sensor_data_{tree_id} (
    id SERIAL PRIMARY KEY,
    ph DECIMAL(4,2),
    volume DECIMAL(10,2),
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    battery_level DECIMAL(5,2),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    timestamp TIMESTAMP,
    status VARCHAR(20)      -- optimal/warning/critical/harvest
);
```

**harvest table:**
```sql
CREATE TABLE harvest (
    id VARCHAR(50) PRIMARY KEY,
    farmer_id VARCHAR(50),
    farmer_name VARCHAR(100),
    tree_id VARCHAR(50),
    volume DECIMAL(10,2),
    ph_level DECIMAL(4,2),
    quality DECIMAL(3,2),
    temperature DECIMAL(5,2),
    timestamp TIMESTAMP,
    status VARCHAR(20)      -- pending/approved/rejected
);
```

---

## 6. API Endpoints Reference

### 6.1 Tree/Prototype Registration

**Register a new prototype/tree:**
```http
POST /api/trees
Content-Type: application/json

{
    "name": "Coconut Tree #1",
    "location": "Section A - Row 1"
}
```

**Response:**
```json
{
    "message": "Tree registered successfully",
    "id": "tree-1739349600000",
    "name": "Coconut Tree #1",
    "sensorTable": "sensor_data_tree_1739349600000"
}
```

### 6.2 Send Sensor Data (From ESP)

**Send sensor readings:**
```http
POST /api/trees/{tree_id}/sensor-data
Content-Type: application/json

{
    "ph": 5.2,
    "volume": 2.5,
    "temperature": 28.5,
    "humidity": 75.0,
    "battery_level": 85.0,
    "latitude": 14.5995,
    "longitude": 120.9842
}
```

**Response:**
```json
{
    "message": "Sensor data recorded",
    "status": "optimal"
}
```

### 6.3 Get Sensor Data History

**Get sensor readings for a tree:**
```http
GET /api/trees/{tree_id}/sensor-data?limit=100
```

**Response:**
```json
[
    {
        "id": 1,
        "ph": 5.2,
        "volume": 2.5,
        "temperature": 28.5,
        "humidity": 75.0,
        "battery_level": 85.0,
        "timestamp": "2024-01-15T08:30:00.000Z",
        "status": "optimal"
    }
]
```

### 6.4 Get All Trees

```http
GET /api/trees
```

### 6.5 Record Harvest

**When sap is collected:**
```http
POST /api/trees/{tree_id}/harvest
Content-Type: application/json

{
    "farmer_id": "user-001",
    "farmer_name": "Juan Dela Cruz"
}
```

### 6.6 Health Check

```http
GET /api/health
```

**Response:**
```json
{
    "status": "ok",
    "message": "SapSense Server is running"
}
```

---

## 7. Testing & Calibration

### 7.1 pH Sensor Calibration

1. **Prepare Buffer Solutions:**
   - pH 4.0 buffer (acidic)
   - pH 7.0 buffer (neutral)

2. **Calibration Process:**
   ```cpp
   // In Arduino Serial Monitor, read raw values:
   // Place probe in pH 7.0 buffer
   float voltage7 = analogRead(PH_PIN) * (3.3 / 4095.0);
   
   // Place probe in pH 4.0 buffer
   float voltage4 = analogRead(PH_PIN) * (3.3 / 4095.0);
   
   // Calculate slope
   float slope = (7.0 - 4.0) / (voltage7 - voltage4);
   
   // Calculate offset
   float offset = 7.0 - (slope * voltage7);
   ```

3. **Update constants in code:**
   ```cpp
   const float PH_SLOPE = calculated_slope;
   const float PH_OFFSET = calculated_offset;
   ```

### 7.2 Ultrasonic Sensor Calibration

1. **Measure your container:**
   - Total height (cm)
   - Inner radius (cm)
   - Distance from sensor to container top

2. **Update constants:**
   ```cpp
   const float CONTAINER_HEIGHT_CM = 30.0;
   const float CONTAINER_RADIUS_CM = 10.0;
   const float SENSOR_OFFSET_CM = 5.0;
   ```

3. **Validate with known volume:**
   - Fill container with 1 liter of water
   - Check if sensor reports ~1.0 L

### 7.3 Testing API Connection

**Using curl from Raspberry Pi:**
```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Register a test tree
curl -X POST http://localhost:3001/api/trees \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Tree", "location": "Test Location"}'

# Send test sensor data
curl -X POST http://localhost:3001/api/trees/tree-1739349600000/sensor-data \
  -H "Content-Type: application/json" \
  -d '{"ph": 5.2, "volume": 2.5, "temperature": 28.5}'

# Get sensor data
curl http://localhost:3001/api/trees/tree-1739349600000/sensor-data
```

---

## 8. Troubleshooting

### 8.1 ESP32/ESP8266 Issues

| Problem | Solution |
|---------|----------|
| WiFi won't connect | Check SSID/password, ensure 2.4GHz network |
| pH readings unstable | Add capacitor (0.1µF) to analog pin, increase sample count |
| Temperature shows -127°C | Check wiring, verify pull-up resistor (4.7kΩ) |
| Ultrasonic shows 0 | Check trigger/echo wiring, verify 5V power |
| HTTP error -1 | Check server IP, verify server is running |

### 8.2 Raspberry Pi Server Issues

| Problem | Solution |
|---------|----------|
| Server won't start | Check `pm2 logs`, verify .env file |
| Database connection failed | Verify PostgreSQL running: `sudo systemctl status postgresql` |
| Port already in use | Kill existing process: `sudo lsof -i :3001` then `kill -9 <PID>` |
| Can't connect from ESP | Check firewall: `sudo ufw status`, verify IP address |

### 8.3 PostgreSQL Issues

| Problem | Solution |
|---------|----------|
| Authentication failed | Reset password in pg_hba.conf, restart PostgreSQL |
| Connection refused | Check postgresql.conf `listen_addresses`, restart service |
| Permission denied | Grant privileges: `GRANT ALL ON ALL TABLES...` |

### 8.4 Useful Commands

```bash
# Check server status
pm2 status

# View server logs
pm2 logs sapsense-server

# Restart server
pm2 restart sapsense-server

# Check PostgreSQL status
sudo systemctl status postgresql

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Test database connection
psql -h localhost -U sapsense_user -d sapsense_db

# Check network ports
sudo netstat -tlpn | grep -E '3001|5432'

# Check Raspberry Pi IP
ip addr show
```

---

## Quick Start Checklist

- [ ] Assemble hardware (ESP32 + sensors)
- [ ] Flash Arduino code to ESP32
- [ ] Set up Raspberry Pi with Raspberry Pi OS
- [ ] Install Node.js and PostgreSQL on Pi
- [ ] Configure PostgreSQL database
- [ ] Deploy SapSense server
- [ ] Run database setup (`npm run db:setup`)
- [ ] Register tree via API
- [ ] Update ESP32 with correct TREE_ID and SERVER_URL
- [ ] Test end-to-end data flow
- [ ] Calibrate pH sensor with buffer solutions
- [ ] Validate volume measurements

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SAPSENSE SYSTEM ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────┐
    │   COCONUT TREE #1    │
    │  ┌────────────────┐  │
    │  │  pH Sensor     │  │
    │  │  Temp Sensor   │  │         WiFi
    │  │  Ultrasonic    │──────────────────────┐
    │  │  ESP32         │  │                   │
    │  └────────────────┘  │                   │
    └──────────────────────┘                   │
                                               │
    ┌──────────────────────┐                   │
    │   COCONUT TREE #2    │                   │
    │  ┌────────────────┐  │                   │
    │  │  ESP32 Node    │──────────────────────┤
    │  └────────────────┘  │                   │
    └──────────────────────┘                   │
                                               ▼
                                    ┌──────────────────┐
                                    │  WiFi Router     │
                                    └────────┬─────────┘
                                             │
                                             ▼
                            ┌────────────────────────────────┐
                            │      RASPBERRY PI SERVER       │
                            │  ┌──────────────────────────┐  │
                            │  │   Node.js Express API    │  │
                            │  │   (Port 3001)            │  │
                            │  └────────────┬─────────────┘  │
                            │               │                │
                            │  ┌────────────▼─────────────┐  │
                            │  │     PostgreSQL DB        │  │
                            │  │     (Port 5432)          │  │
                            │  │  ┌────────────────────┐  │  │
                            │  │  │ tree_containers    │  │  │
                            │  │  │ sensor_data_*      │  │  │
                            │  │  │ harvest            │  │  │
                            │  │  │ users              │  │  │
                            │  │  └────────────────────┘  │  │
                            │  └──────────────────────────┘  │
                            └────────────────┬───────────────┘
                                             │
                                             │  HTTP/REST API
                                             ▼
                            ┌────────────────────────────────┐
                            │       WEB DASHBOARD            │
                            │   (React Frontend)             │
                            │   - Real-time monitoring       │
                            │   - Harvest tracking           │
                            │   - Employee management        │
                            └────────────────────────────────┘
```

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs: `pm2 logs sapsense-server`
3. Check PostgreSQL logs: `sudo tail -f /var/log/postgresql/postgresql-15-main.log`
4. Verify network connectivity between ESP and Raspberry Pi

---

*Document Version: 1.0*
*Last Updated: 2024*
