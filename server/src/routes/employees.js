// Employees Routes

const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Get all employees
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM employees ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM employees WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create employee
router.post('/', async (req, res) => {
  try {
    const { user_id, name, email, phone, assigned_trees, location, join_date } = req.body;
    const id = `emp-${Date.now()}`;
    
    await query(
      `INSERT INTO employees (id, user_id, name, email, phone, assigned_trees, location, join_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, user_id, name, email, phone, assigned_trees, location, join_date]
    );
    
    res.status(201).json({ message: 'Employee created', id });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, assigned_trees, status, location, total_harvest, avg_quality } = req.body;
    
    await query(
      `UPDATE employees SET 
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        assigned_trees = COALESCE($3, assigned_trees),
        status = COALESCE($4, status),
        location = COALESCE($5, location),
        total_harvest = COALESCE($6, total_harvest),
        avg_quality = COALESCE($7, avg_quality),
        updated_at = NOW()
       WHERE id = $8`,
      [name, phone, assigned_trees, status, location, total_harvest, avg_quality, req.params.id]
    );
    
    res.json({ message: 'Employee updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM employees WHERE id = $1', [req.params.id]);
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
