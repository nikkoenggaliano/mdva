'use strict';

const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

// List current user's leave requests and balance
router.get('/', async (req, res) => {
  try {
    const [[user]] = await pool.promise().query('SELECT leave_balance FROM users WHERE id=? LIMIT 1', [req.user.id]);
    const [rows] = await pool.promise().query('SELECT * FROM leave_request WHERE user_id=? ORDER BY id DESC', [req.user.id]);
    res.json({ balance: user?.leave_balance || 0, list: rows });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// Create leave request (alias 1)
router.post('/', async (req, res) => {
  try {
    const { start_date, end_date, reason, consume_balance } = req.body || {};
    await pool.promise().query(
      'INSERT INTO leave_request (user_id, start_date, end_date, reason, consume_balance, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, NOW(), NOW())',
      [req.user.id, start_date, end_date, reason, Number(consume_balance)]
    );
    res.status(201).json({ message: 'Leave request submitted' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// Create leave request (alias 2)
router.post('/create', async (req, res) => {
  try {
    const { start_date, end_date, reason, consume_balance } = req.body || {};
    await pool.promise().query(
      'INSERT INTO leave_request (user_id, start_date, end_date, reason, consume_balance, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, NOW(), NOW())',
      [req.user.id, start_date, end_date, reason, Number(consume_balance)]
    );
    res.status(201).json({ message: 'Leave request submitted' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// Get detail by id
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [[row]] = await pool.promise().query('SELECT * FROM leave_request WHERE id=? LIMIT 1', [id]);
    if (!row) return res.status(404).json({ message: 'Not found' });
    // Allow owners; admins/hrd can also view
    if (row.user_id !== req.user.id && !['admin', 'hrd'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(row);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// Cancel pending request (owner only)
router.put('/:id/cancel', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [[row]] = await pool.promise().query('SELECT * FROM leave_request WHERE id=? LIMIT 1', [id]);
    if (!row) return res.status(404).json({ message: 'Not found' });
    if (row.user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    if (Number(row.status) !== 0) return res.status(400).json({ message: 'Only pending requests can be canceled' });
    await pool.promise().query('UPDATE leave_request SET status=3, updated_at=NOW() WHERE id=?', [id]);
    res.json({ message: 'Leave request canceled' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;


