// Tree Containers Routes

const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Get all trees
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM tree_containers ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get trees by farmer
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const result = await query('SELECT * FROM tree_containers WHERE assigned_farmer_id = $1', [req.params.farmerId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single tree
router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM tree_containers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tree not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update tree data
router.put('/:id', async (req, res) => {
  try {
    const { current_ph, current_volume, current_temperature, status, assigned_farmer_id, assigned_farmer_name } = req.body;
    
    await query(
      `UPDATE tree_containers SET 
        current_ph = COALESCE($1, current_ph),
        current_volume = COALESCE($2, current_volume),
        current_temperature = COALESCE($3, current_temperature),
        status = COALESCE($4, status),
        assigned_farmer_id = COALESCE($5, assigned_farmer_id),
        assigned_farmer_name = COALESCE($6, assigned_farmer_name),
        last_reading = NOW()
       WHERE id = $7`,
      [current_ph, current_volume, current_temperature, status, assigned_farmer_id, assigned_farmer_name, req.params.id]
    );
    
    res.json({ message: 'Tree updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
