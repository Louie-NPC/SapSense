// Harvest Routes
// Handles harvest record management and statistics

const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Get all harvest records with optional filters
router.get('/', async (req, res) => {
  try {
    const { farmer_id, limit = 100, start_date, end_date } = req.query;
    
    let queryStr = `
      SELECT h.*, t.name as tree_name 
      FROM harvest h 
      LEFT JOIN tree_containers t ON h.tree_id = t.id 
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    
    if (farmer_id) {
      queryStr += ` AND h.farmer_id = $${paramIndex}`;
      params.push(farmer_id);
      paramIndex++;
    }
    
    if (start_date) {
      queryStr += ` AND h.timestamp >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }
    
    if (end_date) {
      queryStr += ` AND h.timestamp <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }
    
    queryStr += ` ORDER BY h.timestamp DESC LIMIT $${paramIndex}`;
    params.push(limit);
    
    const result = await query(queryStr, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching harvest records:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get harvest summary statistics
router.get('/summary', async (req, res) => {
  try {
    const summaryResult = await query(`
      SELECT 
        COALESCE(SUM(volume), 0) as total_volume,
        COUNT(*) as total_records,
        COALESCE(AVG(quality), 0) as avg_quality,
        COALESCE(SUM(CASE WHEN timestamp >= CURRENT_DATE THEN volume ELSE 0 END), 0) as today_volume,
        COALESCE(SUM(CASE WHEN timestamp >= CURRENT_DATE - INTERVAL '7 days' THEN volume ELSE 0 END), 0) as week_volume,
        COALESCE(SUM(CASE WHEN timestamp >= CURRENT_DATE - INTERVAL '30 days' THEN volume ELSE 0 END), 0) as month_volume
      FROM harvest
      WHERE status = 'approved'
    `);
    
    const summary = summaryResult.rows[0];
    res.json({
      total_volume: parseFloat(summary.total_volume) || 0,
      total_records: parseInt(summary.total_records) || 0,
      avg_quality: parseFloat(summary.avg_quality) || 0,
      today_volume: parseFloat(summary.today_volume) || 0,
      week_volume: parseFloat(summary.week_volume) || 0,
      month_volume: parseFloat(summary.month_volume) || 0
    });
  } catch (error) {
    console.error('Error fetching harvest summary:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get harvest records by farmer
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { limit = 50 } = req.query;
    
    const result = await query(`
      SELECT h.*, t.name as tree_name 
      FROM harvest h 
      LEFT JOIN tree_containers t ON h.tree_id = t.id 
      WHERE h.farmer_id = $1
      ORDER BY h.timestamp DESC 
      LIMIT $2
    `, [farmerId, limit]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching farmer harvest records:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get harvest record by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await query(`
      SELECT h.*, t.name as tree_name 
      FROM harvest h 
      LEFT JOIN tree_containers t ON h.tree_id = t.id 
      WHERE h.id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Harvest record not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching harvest record:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update harvest status (approve/reject)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    await query(
      'UPDATE harvest SET status = $1 WHERE id = $2',
      [status, req.params.id]
    );
    
    res.json({ message: 'Harvest status updated' });
  } catch (error) {
    console.error('Error updating harvest status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get farmer harvest statistics
router.get('/farmer/:farmerId/stats', async (req, res) => {
  try {
    const { farmerId } = req.params;
    
    const statsResult = await query(`
      SELECT 
        COALESCE(SUM(volume), 0) as total_volume,
        COUNT(*) as total_records,
        COALESCE(AVG(quality), 0) as avg_quality,
        COALESCE(SUM(CASE WHEN timestamp >= CURRENT_DATE THEN volume ELSE 0 END), 0) as today_volume,
        COALESCE(SUM(CASE WHEN timestamp >= CURRENT_DATE - INTERVAL '7 days' THEN volume ELSE 0 END), 0) as week_volume,
        COALESCE(SUM(CASE WHEN timestamp >= CURRENT_DATE - INTERVAL '30 days' THEN volume ELSE 0 END), 0) as month_volume
      FROM harvest
      WHERE farmer_id = $1 AND status = 'approved'
    `, [farmerId]);
    
    const stats = statsResult.rows[0];
    res.json({
      total_volume: parseFloat(stats.total_volume) || 0,
      total_records: parseInt(stats.total_records) || 0,
      avg_quality: parseFloat(stats.avg_quality) || 0,
      today_volume: parseFloat(stats.today_volume) || 0,
      week_volume: parseFloat(stats.week_volume) || 0,
      month_volume: parseFloat(stats.month_volume) || 0
    });
  } catch (error) {
    console.error('Error fetching farmer harvest stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all employees' harvest performance (monthly and weekly stats)
router.get('/employees/performance', async (req, res) => {
  try {
    const performanceResult = await query(`
      SELECT 
        e.id as employee_id,
        e.name as employee_name,
        e.assigned_trees,
        e.status as employee_status,
        COALESCE(h.total_harvest, 0) as total_harvest,
        COALESCE(h.month_harvest, 0) as month_harvest,
        COALESCE(h.week_harvest, 0) as week_harvest,
        COALESCE(h.today_harvest, 0) as today_harvest,
        COALESCE(h.avg_quality, 0) as avg_quality,
        COALESCE(h.harvest_count, 0) as harvest_count
      FROM employees e
      LEFT JOIN (
        SELECT 
          farmer_id,
          SUM(volume) as total_harvest,
          SUM(CASE WHEN timestamp >= CURRENT_DATE - INTERVAL '30 days' THEN volume ELSE 0 END) as month_harvest,
          SUM(CASE WHEN timestamp >= CURRENT_DATE - INTERVAL '7 days' THEN volume ELSE 0 END) as week_harvest,
          SUM(CASE WHEN timestamp >= CURRENT_DATE THEN volume ELSE 0 END) as today_harvest,
          AVG(quality) as avg_quality,
          COUNT(*) as harvest_count
        FROM harvest
        WHERE status = 'approved'
        GROUP BY farmer_id
      ) h ON e.id = h.farmer_id OR e.user_id = h.farmer_id
      WHERE e.status = 'active'
      ORDER BY h.month_harvest DESC NULLS LAST
    `);
    
    res.json(performanceResult.rows.map(row => ({
      employeeId: row.employee_id,
      employeeName: row.employee_name,
      assignedTrees: row.assigned_trees || [],
      totalHarvest: parseFloat(row.total_harvest) || 0,
      monthHarvest: parseFloat(row.month_harvest) || 0,
      weekHarvest: parseFloat(row.week_harvest) || 0,
      todayHarvest: parseFloat(row.today_harvest) || 0,
      avgQuality: parseFloat(row.avg_quality) || 0,
      harvestCount: parseInt(row.harvest_count) || 0
    })));
  } catch (error) {
    console.error('Error fetching employee performance:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get recent harvest activities
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const recentResult = await query(`
      SELECT 
        h.id,
        h.farmer_id,
        h.farmer_name,
        h.tree_id,
        t.name as tree_name,
        h.volume,
        h.ph_level,
        h.quality,
        h.temperature,
        h.timestamp,
        h.status
      FROM harvest h
      LEFT JOIN tree_containers t ON h.tree_id = t.id
      WHERE h.status = 'approved'
      ORDER BY h.timestamp DESC
      LIMIT $1
    `, [limit]);
    
    res.json(recentResult.rows.map(row => ({
      id: row.id,
      farmerId: row.farmer_id,
      farmerName: row.farmer_name,
      treeId: row.tree_id,
      treeName: row.tree_name,
      volume: parseFloat(row.volume) || 0,
      phLevel: parseFloat(row.ph_level) || 0,
      quality: parseFloat(row.quality) || 0,
      temperature: parseFloat(row.temperature) || 0,
      timestamp: row.timestamp,
      status: row.status
    })));
  } catch (error) {
    console.error('Error fetching recent harvests:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get harvest performance metrics (efficiency, productivity)
router.get('/metrics', async (req, res) => {
  try {
    // Get current month and previous month stats for comparison
    const metricsResult = await query(`
      WITH current_month AS (
        SELECT 
          COALESCE(SUM(volume), 0) as volume,
          COUNT(*) as count,
          COALESCE(AVG(quality), 0) as quality
        FROM harvest 
        WHERE status = 'approved' 
        AND timestamp >= DATE_TRUNC('month', CURRENT_DATE)
      ),
      previous_month AS (
        SELECT 
          COALESCE(SUM(volume), 0) as volume,
          COUNT(*) as count,
          COALESCE(AVG(quality), 0) as quality
        FROM harvest 
        WHERE status = 'approved' 
        AND timestamp >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        AND timestamp < DATE_TRUNC('month', CURRENT_DATE)
      ),
      tree_stats AS (
        SELECT COUNT(*) as total_trees FROM tree_containers
      ),
      employee_stats AS (
        SELECT COUNT(*) as active_employees FROM employees WHERE status = 'active'
      )
      SELECT 
        cm.volume as current_volume,
        cm.count as current_count,
        cm.quality as current_quality,
        pm.volume as previous_volume,
        pm.count as previous_count,
        pm.quality as previous_quality,
        ts.total_trees,
        es.active_employees
      FROM current_month cm, previous_month pm, tree_stats ts, employee_stats es
    `);
    
    const metrics = metricsResult.rows[0];
    
    // Calculate efficiency (harvest count / active trees ratio)
    const totalTrees = parseInt(metrics.total_trees) || 1;
    const efficiency = Math.min(100, ((parseInt(metrics.current_count) || 0) / totalTrees) * 100);
    
    // Calculate productivity (current month volume vs target)
    // Target is based on previous month + 10% growth
    const prevVolume = parseFloat(metrics.previous_volume) || 1;
    const currentVolume = parseFloat(metrics.current_volume) || 0;
    const target = prevVolume * 1.1;
    const productivity = Math.min(100, (currentVolume / target) * 100);
    
    // Calculate month over month growth
    const volumeGrowth = prevVolume > 0 ? ((currentVolume - prevVolume) / prevVolume) * 100 : 0;
    
    res.json({
      efficiency: Math.round(efficiency),
      productivity: Math.round(productivity),
      currentVolume: currentVolume,
      previousVolume: prevVolume,
      volumeGrowth: Math.round(volumeGrowth),
      avgQuality: parseFloat(metrics.current_quality) || 0,
      harvestCount: parseInt(metrics.current_count) || 0,
      totalTrees: totalTrees,
      activeEmployees: parseInt(metrics.active_employees) || 0
    });
  } catch (error) {
    console.error('Error fetching harvest metrics:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
