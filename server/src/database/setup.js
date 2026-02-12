// Database Setup Script
// Creates all tables in PostgreSQL

const { pool } = require('../config/database');

const createTables = async () => {
  console.log('🚀 Starting database setup...\n');

  try {
    // Users table
    console.log('📦 Creating users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'farmer')),
        phone VARCHAR(20),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created\n');

    // Employees table
    console.log('📦 Creating employees table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        assigned_trees TEXT[],
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        location VARCHAR(100),
        join_date DATE,
        total_harvest DECIMAL(10,2) DEFAULT 0,
        avg_quality DECIMAL(3,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Employees table created\n');

    // Pay periods table
    console.log('📦 Creating pay_periods table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pay_periods (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'processing')),
        total_payroll DECIMAL(12,2) DEFAULT 0,
        employee_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Pay periods table created\n');

    // Payroll table
    console.log('📦 Creating payroll table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payroll (
        id VARCHAR(50) PRIMARY KEY,
        farmer_id VARCHAR(50) REFERENCES users(id),
        farmer_name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        pay_period VARCHAR(100),
        pay_period_id VARCHAR(50) REFERENCES pay_periods(id),
        base_harvest DECIMAL(10,2) DEFAULT 0,
        quality_bonus DECIMAL(10,2) DEFAULT 0,
        deductions DECIMAL(10,2) DEFAULT 0,
        gross_pay DECIMAL(12,2) DEFAULT 0,
        net_pay DECIMAL(12,2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'on-hold')),
        payment_date DATE,
        payment_method VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Payroll table created\n');

    // Bonus deductions table
    console.log('📦 Creating bonus_deductions table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bonus_deductions (
        id VARCHAR(50) PRIMARY KEY,
        farmer_id VARCHAR(50) REFERENCES users(id),
        farmer_name VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('bonus', 'deduction')),
        category VARCHAR(50),
        amount DECIMAL(10,2) NOT NULL,
        description TEXT,
        date DATE,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Bonus deductions table created\n');

    // Notifications table
    console.log('📦 Creating notifications table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(50) PRIMARY KEY,
        type VARCHAR(20) NOT NULL CHECK (type IN ('critical', 'warning', 'info', 'success')),
        title VARCHAR(200) NOT NULL,
        message TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        farmer_id VARCHAR(50) REFERENCES users(id),
        farmer_name VARCHAR(100),
        tree_id VARCHAR(50),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
        priority VARCHAR(20) DEFAULT 'low' CHECK (priority IN ('high', 'medium', 'low')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Notifications table created\n');

    // Disputes table
    console.log('📦 Creating disputes table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS disputes (
        id VARCHAR(50) PRIMARY KEY,
        farmer_id VARCHAR(50) REFERENCES users(id),
        farmer_name VARCHAR(100) NOT NULL,
        tree_id VARCHAR(50),
        farm_ph DECIMAL(4,2),
        plant_ph DECIMAL(4,2),
        farm_volume DECIMAL(10,2),
        plant_volume DECIMAL(10,2),
        farm_timestamp TIMESTAMP,
        plant_timestamp TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'rejected')),
        discrepancy DECIMAL(4,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Disputes table created\n');

    // Tree containers table
    console.log('📦 Creating tree_containers table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tree_containers (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        location VARCHAR(100),
        assigned_farmer_id VARCHAR(50) REFERENCES users(id),
        assigned_farmer_name VARCHAR(100),
        current_ph DECIMAL(4,2),
        current_volume DECIMAL(10,2),
        current_temperature DECIMAL(5,2),
        status VARCHAR(20) DEFAULT 'healthy' CHECK (status IN ('healthy', 'warning', 'critical', 'optimal', 'harvest')),
        last_reading TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tree containers table created\n');

    // Harvest table
    console.log('📦 Creating harvest table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS harvest (
        id VARCHAR(50) PRIMARY KEY,
        farmer_id VARCHAR(50) REFERENCES users(id),
        farmer_name VARCHAR(100) NOT NULL,
        tree_id VARCHAR(50) REFERENCES tree_containers(id),
        volume DECIMAL(10,2),
        ph_level DECIMAL(4,2),
        quality DECIMAL(3,2),
        temperature DECIMAL(5,2),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Harvest table created\n');

    // Settings table
    console.log('📦 Creating settings table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR(50) PRIMARY KEY DEFAULT 'system',
        ph_optimal_min DECIMAL(4,2) DEFAULT 5.0,
        ph_optimal_max DECIMAL(4,2) DEFAULT 5.5,
        ph_critical_min DECIMAL(4,2) DEFAULT 4.8,
        ph_critical_max DECIMAL(4,2) DEFAULT 7.2,
        volume_alert INTEGER DEFAULT 90,
        temperature_alert INTEGER DEFAULT 35,
        push_enabled BOOLEAN DEFAULT true,
        sms_enabled BOOLEAN DEFAULT true,
        email_enabled BOOLEAN DEFAULT false,
        sound_enabled BOOLEAN DEFAULT true,
        auto_approval_enabled BOOLEAN DEFAULT true,
        ph_tolerance DECIMAL(3,2) DEFAULT 0.3,
        volume_tolerance DECIMAL(3,2) DEFAULT 0.5,
        ph_offset DECIMAL(3,2) DEFAULT 0.0,
        last_calibrated DATE,
        next_calibration_due DATE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Settings table created\n');

    // Create indexes for better performance
    console.log('📦 Creating indexes...');
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_payroll_farmer_id ON payroll(farmer_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_payroll_status ON payroll(status)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_harvest_farmer_id ON harvest(farmer_id)`);
    console.log('✅ Indexes created\n');

    console.log('🎉 Database setup complete!');
    console.log('📝 Next step: Run "npm run db:seed" to add sample data\n');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
};

// Run setup
createTables();
