'use strict';

const express = require('express');
const { pool } = require('../../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Math.min(Number(req.query.pageSize || 10), 100);
    const offset = (page - 1) * pageSize;
    const search = req.query.search ? `%${req.query.search}%` : null;
    if (search) {
      const [rows] = await pool.promise().query(
        `SELECT la.*, u.full_name AS user_full_name, u.email AS user_email
         FROM log_access la
         LEFT JOIN users u ON la.user_id = u.id
         WHERE (u.full_name LIKE ? OR u.email LIKE ? OR la.ip_address LIKE ? OR la.user_agent LIKE ? OR la.notes LIKE ?)
         ORDER BY la.id DESC LIMIT ? OFFSET ?`,
        [search, search, search, search, search, pageSize, offset]
      );
      const [cnt] = await pool.promise().query(
        `SELECT COUNT(*) AS total FROM log_access la
         LEFT JOIN users u ON la.user_id = u.id
         WHERE (u.full_name LIKE ? OR u.email LIKE ? OR la.ip_address LIKE ? OR la.user_agent LIKE ? OR la.notes LIKE ?)`,
        [search, search, search, search, search]
      );
      return res.json({ data: rows, total: cnt?.[0]?.total || 0, page, pageSize });
    } else {
      const [rows] = await pool.promise().query(
        `SELECT la.*, u.full_name AS user_full_name, u.email AS user_email
         FROM log_access la
         LEFT JOIN users u ON la.user_id = u.id
         ORDER BY la.id DESC LIMIT ? OFFSET ?`,
        [pageSize, offset]
      );
      const [cnt] = await pool.promise().query('SELECT COUNT(*) AS total FROM log_access');
      return res.json({ data: rows, total: cnt?.[0]?.total || 0, page, pageSize });
    }
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.promise().query('DELETE FROM log_access WHERE id=?', [req.params.id]);
    res.json({ message: 'Log deleted' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;


