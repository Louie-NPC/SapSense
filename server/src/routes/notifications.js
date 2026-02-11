// Notifications Routes

const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Get all notifications
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM notifications ORDER BY timestamp DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get active notifications
router.get('/active', async (req, res) => {
  try {
    const result = await query("SELECT * FROM notifications WHERE status = 'active' ORDER BY timestamp DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create notification
router.post('/', async (req, res) => {
  try {
    const { type, title, message, farmer_id, farmer_name, tree_id, priority } = req.body;
    const id = `notif-${Date.now()}`;
    
    await query(
      'INSERT INTO notifications (id, type, title, message, farmer_id, farmer_name, tree_id, priority) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [id, type, title, message, farmer_id, farmer_name, tree_id, priority]
    );
    
    res.status(201).json({ message: 'Notification created', id });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update notification status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await query('UPDATE notifications SET status = $1, updated_at = NOW() WHERE id = $2', [status, req.params.id]);
    res.json({ message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
