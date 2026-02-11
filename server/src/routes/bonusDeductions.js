// Bonus/Deductions Routes

const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Get all bonus/deductions
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM bonus_deductions ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get by farmer
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const result = await query('SELECT * FROM bonus_deductions WHERE farmer_id = $1 ORDER BY date DESC', [req.params.farmerId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get pending
router.get('/pending', async (req, res) => {
  try {
    const result = await query("SELECT * FROM bonus_deductions WHERE status = 'pending' ORDER BY date DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create bonus/deduction
router.post('/', async (req, res) => {
  try {
    const { farmer_id, farmer_name, type, category, amount, description, date } = req.body;
    const id = `bd-${Date.now()}`;
    
    await query(
      'INSERT INTO bonus_deductions (id, farmer_id, farmer_name, type, category, amount, description, date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [id, farmer_id, farmer_name, type, category, amount, description, date]
    );
    
    res.status(201).json({ message: 'Bonus/deduction created', id });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await query('UPDATE bonus_deductions SET status = $1, updated_at = NOW() WHERE id = $2', [status, req.params.id]);
    res.json({ message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
