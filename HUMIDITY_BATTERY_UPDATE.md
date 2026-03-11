# Humidity and Battery Level Database Integration

## Overview
This update enables real-time fetching of humidity and battery level data from the **same sensor_data tables** used for pH, temperature, and volume - instead of using hardcoded default values (75% humidity, 85% battery).

## Architecture

### Data Storage Pattern
All sensor readings are stored in dedicated `sensor_data_{tree-id}` tables:
- `ph` - pH level
- `volume` - Sap volume
- `temperature` - Temperature
- `humidity` - Humidity level ✨
- `battery_level` - Battery percentage ✨

When fetching trees, the backend queries the latest sensor reading to get humidity and battery values.

## Changes Made

### 1. Backend API Updates

#### File: `server/src/routes/trees.js`
**GET /trees (Get all trees):**
- Enhanced to fetch latest humidity and battery from each tree's sensor_data table
- Appends `current_humidity` and `current_battery_level` to response

**GET /trees/farmer/:farmerId:**
- Same enhancement for farmer-specific tree queries

**GET /trees/:id (Get single tree):**
- Fetches latest sensor reading to include humidity and battery

**POST /trees/:id/sensor-data:**
- Already stores humidity and battery in sensor_data tables ✅

**POST /trees/:id/harvest:**
- Resets all sensor values including humidity and battery to 0

### 3. TypeScript Interface Updates

#### File: `src/services/api.ts`
Added to `TreeData` interface:
```typescript
current_humidity?: number;
current_battery_level?: number;
```

#### File: `CocoSapMobile/src/services/api.ts`
Same updates to `TreeData` interface for mobile app consistency

### 4. Frontend Dashboard Updates

#### File: `src/pages/FarmerDashboard.tsx`
Updated `treeToSensorData` function:
```typescript
const humidity = parseFloat(String(tree.current_humidity)) || 0;
const batteryLevel = parseFloat(String(tree.current_battery_level)) || 0;

// Instead of hardcoded defaults:
// humidity: 75, // Default value
// batteryLevel: 85, // Default value

// Now uses actual database values:
humidity: Number(humidity.toFixed(2)),
batteryLevel: Number(batteryLevel.toFixed(2)),
```

#### File: `src/pages/Index.tsx`
Same updates for Admin dashboard

#### File: `CocoSapMobile/src/screens/FarmerDashboardScreen.tsx`
Same updates for mobile app

### How It Works

### Before This Update:
1. Sensor data (humidity, battery) sent from device → stored in `sensor_data_*` tables
2. Backend only returned pH, volume, temperature from `tree_containers`
3. Frontend fetched trees → got humidity/battery as `undefined`
4. Frontend used hardcoded defaults: `humidity: 75`, `batteryLevel: 85`

### After This Update:
1. Sensor data sent from device → stored in `sensor_data_{tree-id}` tables (ALL sensors together)
2. Backend fetches latest sensor reading from `sensor_data_{tree-id}` table
3. Backend appends `current_humidity` and `current_battery_level` to tree data
4. Frontend fetches trees → gets actual humidity/battery values from same sensor table
5. Displays real-time sensor data instead of defaults

## Data Flow

```
ESP32 Device
    ↓ (sends all sensor data)
POST /trees/:id/sensor-data
    ↓
Backend stores in:
  - sensor_data_tree-{id} (ALL sensors: ph, volume, temp, humidity, battery)
    ↓
Frontend fetches: GET /trees or GET /trees/farmer/:id
    ↓
Backend queries latest sensor reading from sensor_data table
    ↓
Appends current_humidity & current_battery_level to response
    ↓
Displays real values instead of defaults
```

## Testing Checklist

- [ ] Start backend server: `npm run dev`
- [ ] Send sensor data with humidity and battery values
- [ ] Check database: verify humidity and battery_level are in sensor_data table
- [ ] Open Farmer Dashboard: verify humidity and battery show actual values (not 75/85)
- [ ] Open Admin Dashboard: same verification
- [ ] Test harvest: verify all sensors reset to 0 (including humidity and battery)
- [ ] Test mobile app: verify same behavior

## Database Verification Commands

```sql
-- Check sensor data table structure (all sensors in one table)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name LIKE 'sensor_data_tree%' 
AND column_name IN ('ph', 'volume', 'temperature', 'humidity', 'battery_level');

-- View latest sensor readings for a specific tree
SELECT * FROM sensor_data_tree-YOUR_TREE_ID 
ORDER BY timestamp DESC 
LIMIT 1;

-- View all sensor data with humidity and battery
SELECT 
    id,
    ph,
    volume,
    temperature,
    humidity,
    battery_level,
    timestamp
FROM sensor_data_tree-YOUR_TREE_ID
ORDER BY timestamp DESC;
```

## Benefits

1. **Unified Data Model**: All sensors stored in same table structure (ph, volume, temp, humidity, battery)
2. **Accurate Real-Time Data**: Displays actual sensor readings instead of defaults
3. **Consistent UX**: All sensor values behave the same way (fetched from sensor_data table)
4. **Better Monitoring**: Farmers can see actual battery levels and plan maintenance
5. **Data Integrity**: No confusion between default values and actual readings
6. **Sleep Mode Support**: All sensors show 0 when tree is sleeping/harvested

## Related Files Modified

### Backend:
- ✅ `server/src/routes/trees.js` - Enhanced GET endpoints to fetch latest sensor data

### Frontend Web:
- ✅ `src/services/api.ts` - TreeData interface includes optional humidity/battery fields
- ✅ `src/pages/FarmerDashboard.tsx` - Parses and displays actual values from database
- ✅ `src/pages/Index.tsx` - Admin dashboard with same logic

### Mobile App:
- ✅ `CocoSapMobile/src/services/api.ts` - TreeData interface updated
- ✅ `CocoSapMobile/src/screens/FarmerDashboardScreen.tsx` - Displays real sensor values

## Notes

- **No Database Migration Needed**: Uses existing sensor_data tables - no schema changes required!
- **Backward Compatible**: Existing code will work, new fields are optional
- **Default Value**: Shows 0 when no sensor data available (instead of 75/85 defaults)
- **Consistent with Sleep Mode**: All sensors show 0 when tree is sleeping/harvested
- **Performance**: Queries only latest sensor reading per tree (minimal overhead)
