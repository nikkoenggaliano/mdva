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
      'SELECT * FROM events WHERE title LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?',
      [search, pageSize, offset]
    );
    const [countRows] = await pool.promise().query(
      'SELECT COUNT(*) AS total FROM events WHERE title LIKE ?',
      [search]
    );
    res.json({ data: rows, total: countRows?.[0]?.total || 0, page, pageSize });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.promise().query('SELECT * FROM events WHERE id=? LIMIT 1', [req.params.id]);
    if (!rows || rows.length === 0) {
    return res.status(404).json({ message: 'Not found' });
  }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, image, start_date, end_date, status = 0 } = req.body || {};
    await pool.promise().query(
      'INSERT INTO events (title, description, image, start_date, end_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [title, description, image || null, start_date, end_date, Number(status)]
    );
    res.status(201).json({ message: 'Event created' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description, image, start_date, end_date, status } = req.body || {};
    await pool.promise().query(
      'UPDATE events SET title=?, description=?, image=?, start_date=?, end_date=?, status=?, updated_at=NOW() WHERE id=?',
      [title, description, image || null, start_date, end_date, Number(status), req.params.id]
    );
    res.json({ message: 'Event updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.promise().query('DELETE FROM events WHERE id=?', [req.params.id]);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


