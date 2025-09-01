'use strict';

const express = require('express');
const { pool } = require('../../config/db');

const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const name = req.query.name ? `%${req.query.name}%` : '%%';
    const [rows] = await pool.promise().query(
      'SELECT * FROM users WHERE full_name LIKE ? OR email LIKE ? ORDER BY id DESC LIMIT 100',
      [name, name]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;

 


