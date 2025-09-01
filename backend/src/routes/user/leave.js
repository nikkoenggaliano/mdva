'use strict';

const express = require('express');
const { pool } = require('../../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [[user]] = await pool.promise().query('SELECT leave_balance FROM users WHERE id=? LIMIT 1', [req.user.id]);
    const [rows] = await pool.promise().query('SELECT * FROM leave_request WHERE user_id=? ORDER BY id DESC', [req.user.id]);
    res.json({ balance: user?.leave_balance || 0, list: rows });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

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

// Get detail for a specific leave request (owned by current user)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.promise().query('SELECT * FROM leave_request WHERE id=? AND user_id=? LIMIT 1', [req.params.id, req.user.id]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// Cancel a pending leave request (status 0 -> 3)
router.put('/:id/cancel', async (req, res) => {
  try {
    const [[row]] = await pool.promise().query('SELECT * FROM leave_request WHERE id=? AND user_id=? LIMIT 1', [req.params.id, req.user.id]);
    if (!row) return res.status(404).json({ message: 'Not found' });
    if (Number(row.status) !== 0) return res.status(400).json({ message: 'Only pending requests can be canceled' });
    await pool.promise().query('UPDATE leave_request SET status=3, updated_at=NOW() WHERE id=?', [req.params.id]);
    res.json({ message: 'Leave request canceled' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;

 


