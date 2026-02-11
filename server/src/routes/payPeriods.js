// Pay Periods Routes

const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Get all pay periods
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM pay_periods ORDER BY start_date DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get active pay period
router.get('/active', async (req, res) => {
  try {
    const result = await query("SELECT * FROM pay_periods WHERE status = 'active' LIMIT 1");
    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create pay period
router.post('/', async (req, res) => {
  try {
    const { name, start_date, end_date } = req.body;
    const id = `period-${Date.now()}`;
    
    await query(
      'INSERT INTO pay_periods (id, name, start_date, end_date) VALUES ($1, $2, $3, $4)',
      [id, name, start_date, end_date]
    );
    
    res.status(201).json({ message: 'Pay period created', id });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update pay period status
router.put('/:id', async (req, res) => {
  try {
    const { status, total_payroll, employee_count } = req.body;
    
    await query(
      `UPDATE pay_periods SET 
        status = COALESCE($1, status), 
        total_payroll = COALESCE($2, total_payroll),
        employee_count = COALESCE($3, employee_count),
        updated_at = NOW() 
       WHERE id = $4`,
      [status, total_payroll, employee_count, req.params.id]
    );
    
    res.json({ message: 'Pay period updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
