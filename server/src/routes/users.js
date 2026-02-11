// Users Routes

const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT id, name, email, role, phone, status, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT id, name, email, role, phone, status, created_at FROM users WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, status } = req.body;
    await query(
      'UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone), status = COALESCE($3, status), updated_at = NOW() WHERE id = $4',
      [name, phone, status, req.params.id]
    );
    res.json({ message: 'User updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
