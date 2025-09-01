'use strict';

const express = require('express');
const { pool } = require('../../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const q = req.query.q ? `%${req.query.q}%` : '%%';
    const page = Number(req.query.page || 1);
    const pageSize = Math.min(Number(req.query.pageSize || 10), 100);
    const offset = (page - 1) * pageSize;
    const [rows] = await pool.promise().query(
      `SELECT lr.*, u.full_name AS user_full_name, u.email AS user_email
       FROM leave_request lr
       LEFT JOIN users u ON lr.user_id = u.id
       WHERE u.full_name LIKE ? OR u.email LIKE ?
       ORDER BY lr.id DESC
       LIMIT ? OFFSET ?`,
      [q, q, pageSize, offset]
    );
    const [cnt] = await pool.promise().query(
      `SELECT COUNT(*) AS total
       FROM leave_request lr
       LEFT JOIN users u ON lr.user_id = u.id
       WHERE u.full_name LIKE ? OR u.email LIKE ?`,
      [q, q]
    );
    res.json({ data: rows, total: cnt?.[0]?.total || 0, page, pageSize });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.promise().query(
      `SELECT lr.*, u.full_name AS user_full_name, u.email AS user_email
       FROM leave_request lr
       LEFT JOIN users u ON lr.user_id = u.id
       WHERE lr.id=? LIMIT 1`,
      [req.params.id]
    );
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, comment } = req.body || {};
    if (Number(status) === 2 && (!comment || String(comment).trim() === '')) {
      return res.status(400).json({ message: 'Comment is required for rejection' });
    }
    const [[row]] = await pool.promise().query('SELECT * FROM leave_request WHERE id=? LIMIT 1', [id]);
    if (!row) return res.status(404).json({ message: 'Not found' });

    if (Number(status) === 1) {
      // Check if already approved (status=1)
      if (row.status === 1) {
        return res.status(400).json({ message: 'Leave request already approved' });
      }
      
      const [[u]] = await pool.promise().query('SELECT leave_balance FROM users WHERE id=? LIMIT 1', [row.user_id]);
      const before = u?.leave_balance || 0;
      const after = before - row.consume_balance;
      const log = JSON.stringify({ before, consume: row.consume_balance, after });
      await pool.promise().query('UPDATE users SET leave_balance = ? WHERE id=?', [after, row.user_id]);
      await pool.promise().query('UPDATE leave_request SET status=1, comment=?, log_balance=?, updated_at=NOW() WHERE id=?', [comment || null, log, id]);
      return res.json({ message: 'Approved' });
    }

    await pool.promise().query('UPDATE leave_request SET status=?, comment=?, updated_at=NOW() WHERE id=?', [Number(status), comment || null, id]);
    res.json({ message: 'Status updated' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;


