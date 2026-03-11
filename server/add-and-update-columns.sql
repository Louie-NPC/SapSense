-- ============================================
-- Add Humidity & Battery Columns to tree_containers
-- AND Update with Values
-- ============================================
-- This script:
-- 1. Adds current_humidity column (if not exists)
-- 2. Adds current_battery_level column (if not exists)
-- 3. Updates all trees with default values
-- ============================================

-- STEP 1: Add current_humidity column
-- ============================================
ALTER TABLE tree_containers 
ADD COLUMN IF NOT EXISTS current_humidity DECIMAL(5,2);

-- STEP 2: Add current_battery_level column
-- ============================================
ALTER TABLE tree_containers 
ADD COLUMN IF NOT EXISTS current_battery_level DECIMAL(5,2);

-- Verify columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'tree_containers'
AND column_name IN ('current_humidity', 'current_battery_level');

-- STEP 3: Update ALL trees with humidity and battery values
-- ============================================
-- Set realistic default values for all existing trees

UPDATE tree_containers
SET 
  current_humidity = 68.5,    -- Default humidity: 68.5%
  current_battery_level = 92.0, -- Default battery: 92%
  last_reading = COALESCE(last_reading, NOW())
WHERE current_humidity IS NULL OR current_humidity = 0;

-- STEP 4: Verify the update worked
-- ============================================
SELECT 
  id,
  name,
  current_ph,
  current_volume,
  current_temperature,
  current_humidity,      -- ✨ New column
  current_battery_level, -- ✨ New column
  status,
  assigned_farmer_name
FROM tree_containers
ORDER BY created_at DESC;

-- STEP 5: Check summary statistics
-- ============================================
SELECT 
  COUNT(*) as total_trees,
  COUNT(current_humidity) as trees_with_humidity,
  COUNT(current_battery_level) as trees_with_battery,
  ROUND(AVG(current_humidity), 2) as avg_humidity,
  ROUND(AVG(current_battery_level), 2) as avg_battery,
  MIN(current_humidity) as min_humidity,
  MAX(current_humidity) as max_humidity,
  MIN(current_battery_level) as min_battery,
  MAX(current_battery_level) as max_battery
FROM tree_containers;

-- ============================================
-- OPTIONAL: Set varied/realistic values
-- ============================================
-- If you want different values for each tree instead of uniform values,
-- uncomment the block below:

/*
-- Update with random but realistic values
UPDATE tree_containers
SET 
  current_humidity = ROUND((60 + RANDOM() * 20)::numeric, 1),  -- Random 60-80%
  current_battery_level = ROUND((75 + RANDOM() * 25)::numeric, 1), -- Random 75-100%
  last_reading = NOW()
WHERE current_humidity IS NULL OR current_humidity = 0;
*/

-- ============================================
-- CLEANUP: Remove columns if needed (NOT RECOMMENDED)
-- ============================================
-- Only run these if you need to rollback/remove the columns

/*
-- Remove humidity column
ALTER TABLE tree_containers DROP COLUMN IF EXISTS current_humidity;

-- Remove battery column
ALTER TABLE tree_containers DROP COLUMN IF EXISTS current_battery_level;
*/
