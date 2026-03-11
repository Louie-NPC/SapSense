// Migration script to add humidity and battery level columns to tree_containers table

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting migration...');
    
    // Check if columns already exist
    console.log('📋 Checking if columns exist...');
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tree_containers' 
      AND column_name IN ('current_humidity', 'current_battery_level')
    `);
    
    if (columnCheck.rows.length === 2) {
      console.log('✅ Columns already exist, no migration needed');
      return;
    }
    
    console.log('🔧 Adding current_humidity column...');
    await client.query(`
      ALTER TABLE tree_containers 
      ADD COLUMN IF NOT EXISTS current_humidity DECIMAL(5,2)
    `);
    
    console.log('🔧 Adding current_battery_level column...');
    await client.query(`
      ALTER TABLE tree_containers 
      ADD COLUMN IF NOT EXISTS current_battery_level DECIMAL(5,2)
    `);
    
    console.log('✅ Migration completed successfully!');
    console.log('✨ Added columns:');
    console.log('   - current_humidity (DECIMAL)');
    console.log('   - current_battery_level (DECIMAL)');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);
