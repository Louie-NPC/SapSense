-- Migration script to add sleep_mode column to tree_containers table
-- Run this on existing databases to add the new sleep_mode feature

-- Add sleep_mode column with default value FALSE
ALTER TABLE tree_containers 
ADD COLUMN IF NOT EXISTS sleep_mode BOOLEAN DEFAULT FALSE;

-- Add comment to document the column
COMMENT ON COLUMN tree_containers.sleep_mode IS 'Indicates if tree is in sleep mode (reduced monitoring)';

-- Verify the column was added
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'tree_containers' AND column_name = 'sleep_mode';
