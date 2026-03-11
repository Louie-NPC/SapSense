-- ============================================
-- Update Humidity & Battery in tree_containers
-- ============================================
-- Direct update of tree_containers table
-- No need to modify sensor_data_* tables
-- ============================================

-- STEP 1: View all trees and their current sensor values
-- ============================================
SELECT 
  id,
  name,
  current_ph,
  current_volume,
  current_temperature,
  current_humidity,
  current_battery_level,
  status,
  assigned_farmer_name,
  last_reading
FROM tree_containers
ORDER BY created_at DESC;

-- STEP 2: Update ALL trees with default humidity & battery values
-- ============================================
-- This sets humidity to 68.5% and battery to 92.0% for all trees
-- Uncomment ONLY if you want to update ALL trees at once

/*
UPDATE tree_containers
SET 
  current_humidity = 68.5,
  current_battery_level = 92.0,
  last_reading = COALESCE(last_reading, NOW())
WHERE current_humidity IS NULL OR current_humidity = 0;
*/

-- STEP 3: Update SPECIFIC tree (RECOMMENDED)
-- ============================================
-- Replace 'tree-YOUR_TREE_ID' with your actual tree ID
-- Example: 'tree-1709876543210'

-- Single tree update
UPDATE tree_containers
SET 
  current_humidity = 68.5,    -- Humidity percentage
  current_battery_level = 92.0, -- Battery percentage
  last_reading = NOW()
WHERE id = 'tree-YOUR_TREE_ID';  -- ⚠️ CHANGE THIS to your tree ID

-- STEP 4: Update multiple specific trees
-- ============================================
-- Update several trees at once by listing their IDs

/*
UPDATE tree_containers
SET 
  current_humidity = 68.5,
  current_battery_level = 92.0,
  last_reading = NOW()
WHERE id IN (
  'tree-TREE_ID_1',
  'tree-TREE_ID_2',
  'tree-TREE_ID_3'
);
*/

-- STEP 5: Verify the updates
-- ============================================
-- Check that the values were updated correctly

SELECT 
  id,
  name,
  current_humidity,
  current_battery_level,
  last_reading,
  status
FROM tree_containers
WHERE current_humidity IS NOT NULL 
  AND current_humidity > 0
ORDER BY last_reading DESC;

-- STEP 6: Check which trees still have NULL or 0 values
-- ============================================
-- Find trees that haven't been updated yet

SELECT 
  id,
  name,
  current_humidity,
  current_battery_level,
  assigned_farmer_name,
  'Needs update' as action_required
FROM tree_containers
WHERE current_humidity IS NULL 
   OR current_humidity = 0
   OR current_battery_level IS NULL
   OR current_battery_level = 0
ORDER BY created_at DESC;

-- STEP 7: Optional - Set realistic values based on typical ranges
-- ============================================
-- If you want to set varied values instead of uniform ones

/*
-- Set random humidity between 60-80%
UPDATE tree_containers
SET 
  current_humidity = ROUND((60 + RANDOM() * 20)::numeric, 1),
  current_battery_level = ROUND((80 + RANDOM() * 20)::numeric, 1),
  last_reading = NOW()
WHERE current_humidity IS NULL OR current_humidity = 0;
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count how many trees have been updated
SELECT 
  COUNT(*) as total_trees,
  COUNT(CASE WHEN current_humidity > 0 THEN 1 END) as with_humidity,
  COUNT(CASE WHEN current_battery_level > 0 THEN 1 END) as with_battery,
  ROUND(AVG(current_humidity), 2) as avg_humidity,
  ROUND(AVG(current_battery_level), 2) as avg_battery
FROM tree_containers;

-- Show sample of updated trees
SELECT 
  id,
  name,
  current_humidity,
  current_battery_level,
  status,
  last_reading
FROM tree_containers
WHERE current_humidity > 0
LIMIT 10;
