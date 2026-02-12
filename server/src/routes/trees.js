// Tree Containers Routes
// Handles tree/prototype registration, sensor data tables, and real-time monitoring

const express = require('express');
const { query, getClient } = require('../config/database');

const router = express.Router();

// Helper to generate sensor table name from tree ID
const getSensorTableName = (treeId) => {
  // Sanitize tree ID to create valid table name
  return `sensor_data_${treeId.replace(/-/g, '_')}`;
};

// Get all trees
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM tree_containers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching trees:', error);
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

// Get single tree with latest sensor readings
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

// Get sensor data for a specific tree
router.get('/:id/sensor-data', async (req, res) => {
  try {
    const treeId = req.params.id;
    const tableName = getSensorTableName(treeId);
    const limit = req.query.limit || 100;
    
    // Check if table exists
    const tableCheck = await query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)`,
      [tableName]
    );
    
    if (!tableCheck.rows[0].exists) {
      return res.json([]);
    }
    
    const result = await query(
      `SELECT * FROM ${tableName} ORDER BY timestamp DESC LIMIT $1`,
      [limit]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new tree/prototype (registers tree and creates sensor data table)
router.post('/', async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    const { name, location, latitude, longitude } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Tree name is required' });
    }
    
    // Generate unique tree ID
    const treeId = `tree-${Date.now()}`;
    const tableName = getSensorTableName(treeId);
    
    // Insert tree into tree_containers table
    await client.query(
      `INSERT INTO tree_containers (id, name, location, status, created_at, current_ph, current_volume, current_temperature)
       VALUES ($1, $2, $3, 'healthy', NOW(), 0, 0, 0)`,
      [treeId, name, location || 'Not specified']
    );
    
    // Create dedicated sensor data table for this tree
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id SERIAL PRIMARY KEY,
        ph DECIMAL(4,2),
        volume DECIMAL(10,2),
        temperature DECIMAL(5,2),
        humidity DECIMAL(5,2),
        battery_level DECIMAL(5,2),
        latitude DECIMAL(10,7),
        longitude DECIMAL(10,7),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'optimal' CHECK (status IN ('optimal', 'warning', 'critical', 'harvest'))
      )
    `);
    
    // Create index on timestamp for faster queries
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_${tableName}_timestamp ON ${tableName}(timestamp DESC)`
    );
    
    await client.query('COMMIT');
    
    res.status(201).json({ 
      message: 'Tree registered successfully', 
      id: treeId,
      name: name,
      sensorTable: tableName
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating tree:', error);
    res.status(500).json({ error: 'Failed to register tree: ' + error.message });
  } finally {
    client.release();
  }
});

// Update tree data (for sensor readings from prototypes)
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

// Receive sensor data from prototype (stores in dedicated table and updates tree_containers)
router.post('/:id/sensor-data', async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    const treeId = req.params.id;
    const { ph, volume, temperature, humidity, battery_level, latitude, longitude } = req.body;
    const tableName = getSensorTableName(treeId);
    
    // Verify tree exists
    const treeCheck = await client.query('SELECT id FROM tree_containers WHERE id = $1', [treeId]);
    if (treeCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Tree not found' });
    }
    
    // Determine status based on pH and other values
    let status = 'optimal';
    if (ph <= 4.8 || ph >= 7.2) status = 'critical';
    else if (ph >= 5.0 && ph <= 5.5) status = 'harvest';
    else if (ph < 5.0 || ph > 6.0) status = 'warning';
    
    // Insert into sensor data table
    await client.query(
      `INSERT INTO ${tableName} (ph, volume, temperature, humidity, battery_level, latitude, longitude, status, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [ph, volume, temperature, humidity, battery_level, latitude, longitude, status]
    );
    
    // Update tree_containers with latest reading
    await client.query(
      `UPDATE tree_containers SET 
        current_ph = $1,
        current_volume = $2,
        current_temperature = $3,
        status = $4,
        last_reading = NOW()
       WHERE id = $5`,
      [ph, volume, temperature, status, treeId]
    );
    
    await client.query('COMMIT');
    
    res.json({ message: 'Sensor data recorded', status });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error recording sensor data:', error);
    res.status(500).json({ error: 'Failed to record sensor data' });
  } finally {
    client.release();
  }
});

// Mark tree as harvested - records harvest, updates employee, resets volume
router.post('/:id/harvest', async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    const treeId = req.params.id;
    const { farmer_id, farmer_name } = req.body;
    
    // Get tree data including current volume
    const treeResult = await client.query(
      'SELECT id, name, current_volume, current_ph, current_temperature, assigned_farmer_id, assigned_farmer_name FROM tree_containers WHERE id = $1',
      [treeId]
    );
    
    if (treeResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Tree not found' });
    }
    
    const tree = treeResult.rows[0];
    const harvestedVolume = parseFloat(tree.current_volume) || 0;
    
    if (harvestedVolume <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No volume to harvest' });
    }
    
    // PRIORITY: Use the tree's assigned farmer first, then fallback to request body
    // This ensures harvest goes to the correct assigned farmer
    const effectiveFarmerId = tree.assigned_farmer_id || farmer_id;
    const effectiveFarmerName = tree.assigned_farmer_name || farmer_name || 'Unknown';
    
    // Generate harvest ID
    const harvestId = `harvest-${Date.now()}`;
    
    // Calculate quality based on pH (optimal range 5.0-5.5 = 1.0 quality)
    const ph = parseFloat(tree.current_ph) || 5.0;
    let quality = 1.0;
    if (ph >= 5.0 && ph <= 5.5) {
      quality = 1.0;
    } else if (ph >= 4.8 && ph < 5.0 || ph > 5.5 && ph <= 6.0) {
      quality = 0.85;
    } else {
      quality = 0.7;
    }
    
    // Insert harvest record
    await client.query(
      `INSERT INTO harvest (id, farmer_id, farmer_name, tree_id, volume, ph_level, quality, temperature, timestamp, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), 'approved')`,
      [harvestId, effectiveFarmerId, effectiveFarmerName, treeId, harvestedVolume, tree.current_ph, quality, tree.current_temperature]
    );
    
    // Update employee's total_harvest and avg_quality if farmer exists
    if (effectiveFarmerId) {
      // Get all harvest records for this farmer to calculate new average quality
      const harvestHistory = await client.query(
        `SELECT quality FROM harvest WHERE farmer_id = $1 AND status = 'approved'`,
        [effectiveFarmerId]
      );
      
      // Calculate new average quality
      const totalQuality = harvestHistory.rows.reduce((sum, h) => sum + parseFloat(h.quality), 0) + quality;
      const avgQuality = totalQuality / (harvestHistory.rows.length + 1);
      
      // Update employee's total_harvest and avg_quality
      await client.query(
        `UPDATE employees SET 
          total_harvest = COALESCE(total_harvest, 0) + $1,
          avg_quality = $2,
          updated_at = NOW()
         WHERE id = $3 OR user_id = $3`,
        [harvestedVolume, avgQuality.toFixed(2), effectiveFarmerId]
      );
    }
    
    // Reset tree volume to 0 and set status to optimal
    await client.query(
      `UPDATE tree_containers SET 
        current_volume = 0,
        status = 'optimal',
        last_reading = NOW()
       WHERE id = $1`,
      [treeId]
    );
    
    await client.query('COMMIT');
    
    res.json({ 
      message: 'Harvest recorded successfully',
      harvest_id: harvestId,
      volume: harvestedVolume,
      quality: quality,
      farmer_id: effectiveFarmerId,
      farmer_name: effectiveFarmerName
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error recording harvest:', error);
    res.status(500).json({ error: 'Failed to record harvest: ' + error.message });
  } finally {
    client.release();
  }
});

// Get harvest history (all or by farmer)
router.get('/harvest/history', async (req, res) => {
  try {
    const { farmer_id, limit = 50 } = req.query;
    
    let queryStr = `
      SELECT h.*, t.name as tree_name 
      FROM harvest h 
      LEFT JOIN tree_containers t ON h.tree_id = t.id 
    `;
    const params = [];
    
    if (farmer_id) {
      queryStr += ` WHERE h.farmer_id = $1`;
      params.push(farmer_id);
    }
    
    queryStr += ` ORDER BY h.timestamp DESC LIMIT $${params.length + 1}`;
    params.push(limit);
    
    const result = await query(queryStr, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching harvest history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete tree/prototype (removes tree and its sensor data table)
router.delete('/:id', async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    const treeId = req.params.id;
    const tableName = getSensorTableName(treeId);
    
    // Check if tree exists
    const treeCheck = await client.query('SELECT id, name FROM tree_containers WHERE id = $1', [treeId]);
    if (treeCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Tree not found' });
    }
    
    const treeName = treeCheck.rows[0].name;
    
    // Drop the sensor data table
    await client.query(`DROP TABLE IF EXISTS ${tableName}`);
    
    // Remove tree from any employee assignments
    await client.query(
      `UPDATE employees SET assigned_trees = array_remove(assigned_trees, $1) WHERE assigned_trees IS NOT NULL AND $1 = ANY(assigned_trees)`,
      [treeId]
    );
    
    // Delete from harvest table (remove foreign key constraint violations)
    await client.query('DELETE FROM harvest WHERE tree_id = $1', [treeId]);
    
    // Delete from notifications
    await client.query('DELETE FROM notifications WHERE tree_id = $1', [treeId]);
    
    // Delete the tree container record
    await client.query('DELETE FROM tree_containers WHERE id = $1', [treeId]);
    
    await client.query('COMMIT');
    
    res.json({ 
      message: 'Tree deleted successfully', 
      deletedTree: treeName,
      deletedTable: tableName
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting tree:', error);
    res.status(500).json({ error: 'Failed to delete tree: ' + error.message });
  } finally {
    client.release();
  }
});

module.exports = router;
