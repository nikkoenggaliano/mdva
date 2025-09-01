'use strict';

const express = require('express');
const { pool } = require('../../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.promise().query('SELECT * FROM settings ORDER BY id DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/', async (req, res) => {
  try {
    const { key, value } = req.body || {};
    if (!key) {
    return res.status(400).json({ message: 'Missing key' });
  }
    await pool.promise().query('INSERT INTO settings (`key`, value, created_at, updated_at) VALUES (?, ?, NOW(), NOW())', [key, value]);
    res.status(201).json({ message: 'Setting created' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { key, value } = req.body || {};
    await pool.promise().query('UPDATE settings SET `key`=?, value=?, updated_at=NOW() WHERE id=?', [key, value, req.params.id]);
    res.json({ message: 'Setting updated' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.promise().query('DELETE FROM settings WHERE id=?', [req.params.id]);
    res.json({ message: 'Setting deleted' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;


