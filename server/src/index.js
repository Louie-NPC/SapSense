// SapSense Backend Server
// Main entry point

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const employeesRoutes = require('./routes/employees');
const payrollRoutes = require('./routes/payroll');
const payPeriodsRoutes = require('./routes/payPeriods');
const bonusDeductionsRoutes = require('./routes/bonusDeductions');
const notificationsRoutes = require('./routes/notifications');
const treesRoutes = require('./routes/trees');
const settingsRoutes = require('./routes/settings');
const harvestRoutes = require('./routes/harvest');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SapSense Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/pay-periods', payPeriodsRoutes);
app.use('/api/bonus-deductions', bonusDeductionsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/trees', treesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/harvest', harvestRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Server error', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🥥 SapSense Server Started!
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server running at: http://localhost:${PORT}
📊 API endpoints:     http://localhost:${PORT}/api
💚 Health check:      http://localhost:${PORT}/api/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

module.exports = app;
