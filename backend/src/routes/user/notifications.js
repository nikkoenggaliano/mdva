'use strict';

const express = require('express');
const { pool } = require('../../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.promise().query('SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC', [req.user.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;

 


