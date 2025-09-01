'use strict';

const express = require('express');
const { pool } = require('../../config/db');

const router = express.Router();

// GET /api/leaves/balance -> { balance: number }
router.get('/balance', async (req, res) => {
  try {
    const [[row]] = await pool.promise().query('SELECT leave_balance FROM users WHERE id=? LIMIT 1', [req.user.id]);
    res.json({ balance: row?.leave_balance || 0 });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


