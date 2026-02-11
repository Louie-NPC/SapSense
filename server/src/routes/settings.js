// Settings Routes

const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Get settings
router.get('/', async (req, res) => {
  try {
    const result = await query("SELECT * FROM settings WHERE id = 'system'");
    if (result.rows.length === 0) {
      return res.json(null);
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update settings
router.put('/', async (req, res) => {
  try {
    const {
      ph_optimal_min,
      ph_optimal_max,
      ph_critical_min,
      ph_critical_max,
      volume_alert,
      temperature_alert,
      push_enabled,
      sms_enabled,
      email_enabled,
      sound_enabled,
      auto_approval_enabled,
      ph_tolerance,
      volume_tolerance,
      ph_offset,
      last_calibrated,
      next_calibration_due
    } = req.body;
    
    await query(
      `UPDATE settings SET 
        ph_optimal_min = COALESCE($1, ph_optimal_min),
        ph_optimal_max = COALESCE($2, ph_optimal_max),
        ph_critical_min = COALESCE($3, ph_critical_min),
        ph_critical_max = COALESCE($4, ph_critical_max),
        volume_alert = COALESCE($5, volume_alert),
        temperature_alert = COALESCE($6, temperature_alert),
        push_enabled = COALESCE($7, push_enabled),
        sms_enabled = COALESCE($8, sms_enabled),
        email_enabled = COALESCE($9, email_enabled),
        sound_enabled = COALESCE($10, sound_enabled),
        auto_approval_enabled = COALESCE($11, auto_approval_enabled),
        ph_tolerance = COALESCE($12, ph_tolerance),
        volume_tolerance = COALESCE($13, volume_tolerance),
        ph_offset = COALESCE($14, ph_offset),
        last_calibrated = COALESCE($15, last_calibrated),
        next_calibration_due = COALESCE($16, next_calibration_due),
        updated_at = NOW()
       WHERE id = 'system'`,
      [
        ph_optimal_min, ph_optimal_max, ph_critical_min, ph_critical_max,
        volume_alert, temperature_alert,
        push_enabled, sms_enabled, email_enabled, sound_enabled,
        auto_approval_enabled, ph_tolerance, volume_tolerance,
        ph_offset, last_calibrated, next_calibration_due
      ]
    );
    
    res.json({ message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
