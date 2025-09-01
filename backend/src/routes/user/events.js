'use strict';

const express = require('express');
const { pool } = require('../../config/db');

const router = express.Router();

// get all events that are active and not past
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.promise().query(
      'SELECT * FROM events WHERE status=0 AND start_date <= CURDATE() AND end_date >= CURDATE() ORDER BY id DESC'
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// get event by id detailed
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.promise().query('SELECT * FROM events WHERE id=? LIMIT 1', [req.params.id]);
    if (!rows || rows.length === 0) {
    return res.status(404).json({ message: 'Not found' });
  }
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;

 


