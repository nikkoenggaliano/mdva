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
      `SELECT m.*, uf.full_name AS from_name, ut.full_name AS to_name
       FROM messages m
       JOIN users uf ON uf.id = m.from_user_id
       JOIN users ut ON ut.id = m.to_user_id
       ORDER BY m.id DESC
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );
    const [cnt] = await pool.promise().query('SELECT COUNT(*) AS total FROM messages');
    res.json({ data: rows, total: cnt?.[0]?.total || 0, page, pageSize });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.promise().query(
      `SELECT m.*, uf.full_name AS from_name, ut.full_name AS to_name
       FROM messages m
       JOIN users uf ON uf.id = m.from_user_id
       JOIN users ut ON ut.id = m.to_user_id
       WHERE m.id=? LIMIT 1`,
      [req.params.id]
    );
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/', async (req, res) => {
  try {
    const { from_user_id, to_user_id, message, attachment = null, status = 0 } = req.body || {};
    await pool.promise().query(
      'INSERT INTO messages (from_user_id, to_user_id, message, attachment, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [Number(from_user_id), Number(to_user_id), message, attachment, Number(status)]
    );
    res.status(201).json({ message: 'Message created' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { from_user_id, to_user_id, message, attachment, status } = req.body || {};
    await pool.promise().query(
      'UPDATE messages SET from_user_id=?, to_user_id=?, message=?, attachment=?, status=?, updated_at=NOW() WHERE id=?',
      [Number(from_user_id), Number(to_user_id), message, attachment, Number(status), req.params.id]
    );
    res.json({ message: 'Message updated' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.promise().query('DELETE FROM messages WHERE id=?', [req.params.id]);
    res.json({ message: 'Message deleted' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;


