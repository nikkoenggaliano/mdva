'use strict';

const express = require('express');
const { pool } = require('../../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Math.min(Number(req.query.pageSize || 10), 100);
    const offset = (page - 1) * pageSize;
    const [rows] = await pool.promise().query(
      `SELECT lr.*, u.full_name AS user_full_name, u.email AS user_email
       FROM leave_request lr
       LEFT JOIN users u ON lr.user_id = u.id
       ORDER BY lr.id DESC LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );
    const [cnt] = await pool.promise().query('SELECT COUNT(*) AS total FROM leave_request');
    res.json({ data: rows, total: cnt?.[0]?.total || 0, page, pageSize });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.promise().query('SELECT * FROM leave_request WHERE id=? LIMIT 1', [req.params.id]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/', async (req, res) => {
  try {
    const { user_id, start_date, end_date, reason, comment = null, consume_balance = 0, log_balance = null, status = 0 } = req.body || {};
    await pool.promise().query(
      'INSERT INTO leave_request (user_id, start_date, end_date, reason, comment, consume_balance, log_balance, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [Number(user_id), start_date, end_date, reason, comment, Number(consume_balance), log_balance, Number(status)]
    );
    res.status(201).json({ message: 'Leave request created' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { user_id, start_date, end_date, reason, comment, consume_balance, log_balance, status } = req.body || {};
    await pool.promise().query(
      'UPDATE leave_request SET user_id=?, start_date=?, end_date=?, reason=?, comment=?, consume_balance=?, log_balance=?, status=?, updated_at=NOW() WHERE id=?',
      [Number(user_id), start_date, end_date, reason, comment, Number(consume_balance), log_balance, Number(status), req.params.id]
    );
    res.json({ message: 'Leave request updated' });
  } catch (e) { res.status(500). json({ message: 'Server error' }); }
});

// Approve: set status=1 and decrement user's leave_balance
router.put('/:id/approve', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [[row]] = await pool.promise().query('SELECT * FROM leave_request WHERE id=? LIMIT 1', [id]);
    if (!row) return res.status(404).json({ message: 'Not found' });
    const [[u]] = await pool.promise().query('SELECT leave_balance FROM users WHERE id=? LIMIT 1', [row.user_id]);
    const before = u?.leave_balance || 0;
    const after = before - row.consume_balance;
    const log = JSON.stringify({ before, consume: row.consume_balance, after });
    await pool.promise().query('UPDATE users SET leave_balance = ? WHERE id=?', [after, row.user_id]);
    await pool.promise().query('UPDATE leave_request SET status=1, log_balance=?, updated_at=NOW() WHERE id=?', [log, id]);
    res.json({ message: 'Approved' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// Reject: set status=2 and save comment
router.put('/:id/reject', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { comment = '' } = req.body || {};
    await pool.promise().query('UPDATE leave_request SET status=2, comment=?, updated_at=NOW() WHERE id=?', [comment, id]);
    res.json({ message: 'Rejected' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.promise().query('DELETE FROM leave_request WHERE id=?', [req.params.id]);
    res.json({ message: 'Leave request deleted' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;


