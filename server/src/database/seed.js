// Database Seed Script
// Adds sample data to the database

const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const farmerPassword = await bcrypt.hash('farmer123', 10);

    // Insert Users
    console.log('👤 Adding users...');
    await pool.query(`
      INSERT INTO users (id, name, email, password, role, phone, status) VALUES
        ('admin-1', 'Admin User', 'admin@sapsense.com', $1, 'admin', '+63 912 000 0001', 'active'),
        ('farmer-1', 'Juan Dela Cruz', 'juan@sapsense.com', $2, 'farmer', '+63 912 345 6789', 'active'),
        ('farmer-2', 'Maria Santos', 'maria@sapsense.com', $2, 'farmer', '+63 912 345 6790', 'active'),
        ('farmer-3', 'Pedro Garcia', 'pedro@sapsense.com', $2, 'farmer', '+63 912 345 6791', 'active'),
        ('farmer-4', 'Ana Reyes', 'ana@sapsense.com', $2, 'farmer', '+63 912 345 6792', 'inactive')
      ON CONFLICT (id) DO NOTHING
    `, [adminPassword, farmerPassword]);
    console.log('✅ Users added\n');

    // Insert Employees
    console.log('👥 Adding employees...');
    await pool.query(`
      INSERT INTO employees (id, user_id, name, email, phone, assigned_trees, status, location, join_date, total_harvest, avg_quality) VALUES
        ('farmer-1', 'farmer-1', 'Juan Dela Cruz', 'juan@sapsense.com', '+63 912 345 6789', ARRAY['container-1', 'container-2', 'container-3'], 'active', 'Block A, Section 1', '2024-01-15', 182, 4.8),
        ('farmer-2', 'farmer-2', 'Maria Santos', 'maria@sapsense.com', '+63 912 345 6790', ARRAY['container-4', 'container-5', 'container-6'], 'active', 'Block B, Section 2', '2024-02-01', 152, 4.5),
        ('farmer-3', 'farmer-3', 'Pedro Garcia', 'pedro@sapsense.com', '+63 912 345 6791', ARRAY['container-7', 'container-8', 'container-9'], 'active', 'Block A, Section 3', '2024-01-20', 168, 4.2),
        ('farmer-4', 'farmer-4', 'Ana Reyes', 'ana@sapsense.com', '+63 912 345 6792', ARRAY['container-10', 'container-11', 'container-12'], 'inactive', 'Block C, Section 1', '2023-12-10', 95, 3.9)
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✅ Employees added\n');

    // Insert Tree Containers
    console.log('🌴 Adding tree containers...');
    await pool.query(`
      INSERT INTO tree_containers (id, name, location, assigned_farmer_id, assigned_farmer_name, current_ph, current_volume, current_temperature, status, last_reading) VALUES
        ('container-1', 'Tree 1', 'Block A, Section 1', 'farmer-1', 'Juan Dela Cruz', 5.4, 8.5, 28, 'healthy', NOW()),
        ('container-2', 'Tree 2', 'Block A, Section 1', 'farmer-1', 'Juan Dela Cruz', 5.6, 7.2, 29, 'healthy', NOW()),
        ('container-3', 'Tree 3', 'Block A, Section 1', 'farmer-1', 'Juan Dela Cruz', 5.3, 9.1, 27, 'healthy', NOW()),
        ('container-4', 'Tree 4', 'Block B, Section 2', 'farmer-2', 'Maria Santos', 5.8, 6.8, 30, 'healthy', NOW()),
        ('container-5', 'Tree 5', 'Block B, Section 2', 'farmer-2', 'Maria Santos', 4.2, 5.5, 32, 'critical', NOW()),
        ('container-6', 'Tree 6', 'Block B, Section 2', 'farmer-2', 'Maria Santos', 5.5, 8.0, 28, 'healthy', NOW()),
        ('container-7', 'Tree 7', 'Block A, Section 3', 'farmer-3', 'Pedro Garcia', 5.2, 7.8, 29, 'healthy', NOW()),
        ('container-8', 'Tree 8', 'Block A, Section 3', 'farmer-3', 'Pedro Garcia', 4.9, 6.2, 31, 'warning', NOW()),
        ('container-9', 'Tree 9', 'Block A, Section 3', 'farmer-3', 'Pedro Garcia', 5.7, 8.8, 27, 'healthy', NOW()),
        ('container-10', 'Tree 10', 'Block C, Section 1', 'farmer-4', 'Ana Reyes', 5.4, 7.0, 28, 'healthy', NOW()),
        ('container-11', 'Tree 11', 'Block C, Section 1', 'farmer-4', 'Ana Reyes', 5.5, 6.5, 29, 'healthy', NOW()),
        ('container-12', 'Tree 12', 'Block C, Section 1', 'farmer-4', 'Ana Reyes', 5.6, 7.5, 28, 'healthy', NOW())
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✅ Tree containers added\n');

    // Insert Pay Periods
    console.log('📅 Adding pay periods...');
    await pool.query(`
      INSERT INTO pay_periods (id, name, start_date, end_date, status, total_payroll, employee_count) VALUES
        ('period-1', 'January 2024 - Week 4', '2024-01-22', '2024-01-28', 'active', 45250.00, 4),
        ('period-2', 'January 2024 - Week 3', '2024-01-15', '2024-01-21', 'closed', 42180.50, 4),
        ('period-3', 'January 2024 - Week 2', '2024-01-08', '2024-01-14', 'closed', 38920.00, 3)
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✅ Pay periods added\n');

    // Insert Payroll
    console.log('💰 Adding payroll records...');
    await pool.query(`
      INSERT INTO payroll (id, farmer_id, farmer_name, email, pay_period, pay_period_id, base_harvest, quality_bonus, deductions, gross_pay, net_pay, status, payment_date, payment_method) VALUES
        ('payroll-1', 'farmer-1', 'Juan Dela Cruz', 'juan@sapsense.com', 'January 2024 - Week 4', 'period-1', 182, 850.00, 150.00, 5400.00, 6100.00, 'pending', '2024-01-29', 'Bank Transfer'),
        ('payroll-2', 'farmer-2', 'Maria Santos', 'maria@sapsense.com', 'January 2024 - Week 4', 'period-1', 152.8, 620.00, 0, 4584.00, 5204.00, 'processing', '2024-01-29', 'Bank Transfer'),
        ('payroll-3', 'farmer-3', 'Pedro Garcia', 'pedro@sapsense.com', 'January 2024 - Week 4', 'period-1', 168.4, 480.00, 200.00, 5052.00, 5332.00, 'paid', '2024-01-28', 'Cash'),
        ('payroll-4', 'farmer-4', 'Ana Reyes', 'ana@sapsense.com', 'January 2024 - Week 4', 'period-1', 95, 180.00, 350.00, 2850.00, 2680.00, 'on-hold', '2024-01-29', 'Bank Transfer')
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✅ Payroll records added\n');

    // Insert Bonus/Deductions
    console.log('🎁 Adding bonus/deductions...');
    await pool.query(`
      INSERT INTO bonus_deductions (id, farmer_id, farmer_name, type, category, amount, description, date, status) VALUES
        ('bd-1', 'farmer-1', 'Juan Dela Cruz', 'bonus', 'Performance', 500.00, 'Exceeded monthly harvest target by 20%', '2024-01-25', 'approved'),
        ('bd-2', 'farmer-1', 'Juan Dela Cruz', 'bonus', 'Quality', 350.00, 'Highest quality rating for the month', '2024-01-25', 'approved'),
        ('bd-3', 'farmer-3', 'Pedro Garcia', 'deduction', 'Equipment', 200.00, 'Equipment damage - collection container', '2024-01-20', 'approved'),
        ('bd-4', 'farmer-4', 'Ana Reyes', 'deduction', 'Absence', 350.00, 'Unexcused absence - 2 days', '2024-01-18', 'pending'),
        ('bd-5', 'farmer-2', 'Maria Santos', 'bonus', 'Attendance', 200.00, 'Perfect attendance for the month', '2024-01-26', 'pending')
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✅ Bonus/deductions added\n');

    // Insert Notifications
    console.log('🔔 Adding notifications...');
    await pool.query(`
      INSERT INTO notifications (id, type, title, message, farmer_id, farmer_name, tree_id, status, priority) VALUES
        ('notif-1', 'critical', 'Critical pH Level Alert', 'Tree container-5 pH level has dropped to 4.2 - immediate attention required', 'farmer-2', 'Maria Santos', 'container-5', 'active', 'high'),
        ('notif-2', 'warning', 'Quality Threshold Warning', 'Tree container-8 sap quality approaching minimum threshold (3.8/5.0)', 'farmer-3', 'Pedro Garcia', 'container-8', 'acknowledged', 'medium'),
        ('notif-3', 'info', 'Harvest Reminder', 'Tree container-1 is ready for harvest - optimal pH level achieved (5.6)', 'farmer-1', 'Juan Dela Cruz', 'container-1', 'active', 'low'),
        ('notif-4', 'success', 'Quality Improvement', 'Tree container-3 pH levels have stabilized after treatment', 'farmer-1', 'Juan Dela Cruz', 'container-3', 'resolved', 'low')
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✅ Notifications added\n');

    // Insert Disputes
    console.log('⚠️ Adding disputes...');
    await pool.query(`
      INSERT INTO disputes (id, farmer_id, farmer_name, tree_id, farm_ph, plant_ph, farm_volume, plant_volume, farm_timestamp, plant_timestamp, status, discrepancy) VALUES
        ('dispute-1', 'farmer-1', 'Juan Dela Cruz', 'container-1', 5.4, 6.8, 8.5, 8.2, '2024-01-15 08:30:00', '2024-01-15 14:20:00', 'pending', 1.4),
        ('dispute-2', 'farmer-2', 'Maria Santos', 'container-4', 5.6, 5.8, 9.1, 9.0, '2024-01-14 09:15:00', '2024-01-14 15:45:00', 'resolved', 0.2),
        ('dispute-3', 'farmer-3', 'Pedro Garcia', 'container-7', 5.2, 7.1, 7.8, 7.5, '2024-01-13 07:45:00', '2024-01-13 13:30:00', 'rejected', 1.9)
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✅ Disputes added\n');

    // Insert Settings
    console.log('⚙️ Adding system settings...');
    await pool.query(`
      INSERT INTO settings (id, ph_optimal_min, ph_optimal_max, ph_critical_min, ph_critical_max, volume_alert, temperature_alert, last_calibrated, next_calibration_due) VALUES
        ('system', 5.0, 5.5, 4.8, 7.2, 90, 35, '2024-01-15', '2024-02-15')
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✅ Settings added\n');

    console.log('🎉 Database seeding complete!\n');
    console.log('📝 Demo accounts:');
    console.log('   Admin: admin@sapsense.com / admin123');
    console.log('   Farmer: juan@sapsense.com / farmer123');
    console.log('   Farmer: maria@sapsense.com / farmer123');
    console.log('   Farmer: pedro@sapsense.com / farmer123\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
};

// Run seed
seedData();
