'use strict';

const express = require('express');
const crypto = require('crypto');
const { pool } = require('../../config/db');

const router = express.Router();

const md5 = (s) => crypto.createHash('md5').update(String(s)).digest('hex');

router.get('/', async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Math.min(Number(req.query.pageSize || 10), 100);
    const search = req.query.search ? `%${req.query.search}%` : '%%';
    const offset = (page - 1) * pageSize;

    const [rows] = await pool.promise().query(
      'SELECT * FROM users WHERE full_name LIKE ? OR email LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?',
      [search, search, pageSize, offset]
    );
    const [countRows] = await pool.promise().query(
      'SELECT COUNT(*) AS total FROM users WHERE full_name LIKE ? OR email LIKE ?',
      [search, search]
    );
    res.json({ data: rows, total: countRows?.[0]?.total || 0, page, pageSize });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.promise().query('SELECT * FROM users WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { full_name, email, password, role = 'user', status = 1 } = req.body || {};
    if (!full_name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const passHash = md5(password);
    await pool.promise().query(
      'INSERT INTO users (full_name, email, password, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [full_name, email, passHash, role, Number(status)]
    );
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { full_name, email, password = '', role, status } = req.body || {};
    if (password) {
      const passHash = md5(password);
      await pool.promise().query(
        'UPDATE users SET full_name=?, email=?, password=?, role=?, status=?, updated_at=NOW() WHERE id=?',
        [full_name, email, passHash, role, Number(status), req.params.id]
      );
    } else {
      await pool.promise().query(
        'UPDATE users SET full_name=?, email=?, role=?, status=?, updated_at=NOW() WHERE id=?',
        [full_name, email, role, Number(status), req.params.id]
      );
    }
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.promise().query('DELETE FROM users WHERE id=?', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



