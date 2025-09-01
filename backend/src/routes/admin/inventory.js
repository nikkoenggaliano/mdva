'use strict';

const express = require('express');
const { pool } = require('../../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Math.min(Number(req.query.pageSize || 10), 100);
    const search = req.query.search ? `%${req.query.search}%` : '%%';
    const offset = (page - 1) * pageSize;
    const [rows] = await pool.promise().query(
      'SELECT * FROM inventory WHERE name LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?',
      [search, pageSize, offset]
    );
    const [cnt] = await pool.promise().query(
      'SELECT COUNT(*) AS total FROM inventory WHERE name LIKE ?', [search]
    );
    res.json({ data: rows, total: cnt?.[0]?.total || 0, page, pageSize });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.promise().query('SELECT * FROM inventory WHERE id=? LIMIT 1', [req.params.id]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, quantity = 0, unit, status = 0 } = req.body || {};
    await pool.promise().query(
      'INSERT INTO inventory (name, description, quantity, unit, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [name, description, Number(quantity), unit, Number(status)]
    );
    res.status(201).json({ message: 'Inventory created' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, description, quantity, unit, status } = req.body || {};
    await pool.promise().query(
      'UPDATE inventory SET name=?, description=?, quantity=?, unit=?, status=?, updated_at=NOW() WHERE id=?',
      [name, description, Number(quantity), unit, Number(status), req.params.id]
    );
    res.json({ message: 'Inventory updated' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.promise().query('DELETE FROM inventory WHERE id=?', [req.params.id]);
    res.json({ message: 'Inventory deleted' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;


