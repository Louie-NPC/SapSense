// Database Reset Script
// Deletes all tables and data

const { pool } = require('../config/database');

const resetDatabase = async () => {
  console.log('🗑️ Starting database reset...\n');
  console.log('⚠️ WARNING: This will delete ALL data!\n');

  try {
    // Drop all tables
    console.log('📦 Dropping tables...');
    
    await pool.query('DROP TABLE IF EXISTS harvest CASCADE');
    console.log('   - harvest dropped');
    
    await pool.query('DROP TABLE IF EXISTS disputes CASCADE');
    console.log('   - disputes dropped');
    
    await pool.query('DROP TABLE IF EXISTS notifications CASCADE');
    console.log('   - notifications dropped');
    
    await pool.query('DROP TABLE IF EXISTS bonus_deductions CASCADE');
    console.log('   - bonus_deductions dropped');
    
    await pool.query('DROP TABLE IF EXISTS payroll CASCADE');
    console.log('   - payroll dropped');
    
    await pool.query('DROP TABLE IF EXISTS pay_periods CASCADE');
    console.log('   - pay_periods dropped');
    
    await pool.query('DROP TABLE IF EXISTS tree_containers CASCADE');
    console.log('   - tree_containers dropped');
    
    await pool.query('DROP TABLE IF EXISTS employees CASCADE');
    console.log('   - employees dropped');
    
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    console.log('   - users dropped');
    
    await pool.query('DROP TABLE IF EXISTS settings CASCADE');
    console.log('   - settings dropped');

    console.log('\n✅ All tables dropped\n');
    console.log('🎉 Database reset complete!');
    console.log('📝 Next steps:');
    console.log('   1. Run "npm run db:setup" to create tables');
    console.log('   2. Run "npm run db:seed" to add sample data\n');

  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
};

// Run reset
resetDatabase();
