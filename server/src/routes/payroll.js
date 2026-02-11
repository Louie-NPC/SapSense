// Payroll Routes

const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Get all payroll records
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM payroll ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get payroll by period
router.get('/period/:periodId', async (req, res) => {
  try {
    const result = await query('SELECT * FROM payroll WHERE pay_period_id = $1', [req.params.periodId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get payroll by farmer
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const result = await query('SELECT * FROM payroll WHERE farmer_id = $1 ORDER BY created_at DESC', [req.params.farmerId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single payroll record
router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM payroll WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create payroll record
router.post('/', async (req, res) => {
  try {
    const { farmer_id, farmer_name, email, pay_period, pay_period_id, base_harvest, quality_bonus, deductions, gross_pay, net_pay, payment_method } = req.body;
    const id = `payroll-${Date.now()}`;
    
    await query(
      `INSERT INTO payroll (id, farmer_id, farmer_name, email, pay_period, pay_period_id, base_harvest, quality_bonus, deductions, gross_pay, net_pay, payment_method) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [id, farmer_id, farmer_name, email, pay_period, pay_period_id, base_harvest, quality_bonus, deductions, gross_pay, net_pay, payment_method]
    );
    
    res.status(201).json({ message: 'Payroll created', id });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update payroll record
router.put('/:id', async (req, res) => {
  try {
    const { base_harvest, quality_bonus, deductions, gross_pay, net_pay, payment_method } = req.body;
    
    await query(
      `UPDATE payroll SET 
        base_harvest = COALESCE($1, base_harvest),
        quality_bonus = COALESCE($2, quality_bonus),
        deductions = COALESCE($3, deductions),
        gross_pay = COALESCE($4, gross_pay),
        net_pay = COALESCE($5, net_pay),
        payment_method = COALESCE($6, payment_method),
        updated_at = NOW()
       WHERE id = $7`,
      [base_harvest, quality_bonus, deductions, gross_pay, net_pay, payment_method, req.params.id]
    );
    
    res.json({ message: 'Payroll updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update payroll status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const paymentDate = status === 'paid' ? new Date().toISOString().split('T')[0] : null;
    
    await query(
      `UPDATE payroll SET status = $1, payment_date = COALESCE($2, payment_date), updated_at = NOW() WHERE id = $3`,
      [status, paymentDate, req.params.id]
    );
    
    res.json({ message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
