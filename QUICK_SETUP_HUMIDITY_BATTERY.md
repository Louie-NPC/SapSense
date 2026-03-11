# Quick Setup Guide - Humidity & Battery Database Integration

## 🚀 Quick Start (2 Steps - No Migration Needed!)

### Step 1: Restart Backend Server
```bash
cd server
npm run dev
```

**That's it!** The backend now automatically fetches humidity and battery from the same sensor_data tables used for pH, temperature, and volume.

### Step 2: Test It!
1. Open your Farmer Dashboard: `http://localhost:5173/farmer-dashboard`
2. Send some sensor data with humidity and battery values:
   ```bash
   curl -X POST http://localhost:3001/api/trees/YOUR_TREE_ID/sensor-data \
     -H "Content-Type: application/json" \
     -d '{
       "ph": 5.2,
       "volume": 1.5,
       "temperature": 28.5,
       "humidity": 68.5,
       "battery_level": 92.0
     }'
   ```
3. Refresh the dashboard - you should see actual values instead of 75/85 defaults!

## ✅ Verification

### Check Sensor Data Table Structure
```sql
-- Verify all sensors are in the same table (including humidity & battery)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name LIKE 'sensor_data_tree%' 
AND column_name IN ('ph', 'volume', 'temperature', 'humidity', 'battery_level');
```

Expected output:
```
column_name     | data_type
----------------+----------
ph              | numeric
volume          | numeric
temperature     | numeric
humidity        | numeric
battery_level   | numeric
```

### View Latest Sensor Reading
```sql
-- See the latest sensor data with ALL values
SELECT 
    id,
    ph,
    volume,
    temperature,
    humidity,
    battery_level,
    timestamp
FROM sensor_data_tree-YOUR_TREE_ID
ORDER BY timestamp DESC
LIMIT 1;
```

## 🔧 Troubleshooting

### Still Seeing 75/85 Values?
1. Make sure backend server is restarted after changes
2. Clear browser cache (Ctrl+Shift+R)
3. Check that sensor data is being sent with humidity and battery fields
4. Verify in database: check sensor_data table has humidity and battery values:
   ```sql
   SELECT humidity, battery_level FROM sensor_data_tree-YOUR_TREE_ID 
   ORDER BY timestamp DESC LIMIT 1;
   ```

### No Sensor Data Table?
If the sensor_data table doesn't exist for a tree, it will be created automatically when the first sensor reading is sent.

### New Trees Show 0 for Everything
That's correct! New trees will show 0 until they receive sensor data. This is better than showing fake default values.

## 📊 What Changed?

**Before:**
```typescript
// Frontend - hardcoded defaults
humidity: 75,
batteryLevel: 85
```

**After:**
```typescript
// Frontend - fetches from database
const humidity = parseFloat(String(tree.current_humidity)) || 0;
const batteryLevel = parseFloat(String(tree.current_battery_level)) || 0;

humidity: Number(humidity.toFixed(2)),
batteryLevel: Number(batteryLevel.toFixed(2))
```

## 🎯 Next Steps

1. **Test Harvest**: Mark a tree as harvested → all sensors should reset to 0 (including humidity/battery)
2. **Test Mobile App**: If using mobile app, rebuild it to get the latest interface changes
3. **Monitor Real Data**: Watch humidity and battery levels change as sensors send data

---

**Need Help?** Check `HUMIDITY_BATTERY_UPDATE.md` for detailed documentation.
