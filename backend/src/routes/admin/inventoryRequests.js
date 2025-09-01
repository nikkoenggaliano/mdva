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
      `SELECT ir.*, u.full_name AS user_full_name, u.email AS user_email, i.name AS inventory_name
       FROM inventory_request ir
       LEFT JOIN users u ON ir.user_id = u.id
       LEFT JOIN inventory i ON ir.inventory_id = i.id
       ORDER BY ir.id DESC LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );
    const [cnt] = await pool.promise().query('SELECT COUNT(*) AS total FROM inventory_request');
    res.json({ data: rows, total: cnt?.[0]?.total || 0, page, pageSize });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.promise().query('SELECT * FROM inventory_request WHERE id=? LIMIT 1', [req.params.id]);
    if (!rows || rows.length === 0) {
    return res.status(404).json({ message: 'Not found' });
  }
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/', async (req, res) => {
  try {
    const { user_id, inventory_id, quantity = 0, status = 0 } = req.body || {};
    await pool.promise().query(
      'INSERT INTO inventory_request (user_id, inventory_id, quantity, status, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [Number(user_id), Number(inventory_id), Number(quantity), Number(status)]
    );
    res.status(201).json({ message: 'Inventory request created' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { user_id, inventory_id, quantity, status } = req.body || {};
    await pool.promise().query(
      'UPDATE inventory_request SET user_id=?, inventory_id=?, quantity=?, status=?, updated_at=NOW() WHERE id=?',
      [Number(user_id), Number(inventory_id), Number(quantity), Number(status), req.params.id]
    );
    res.json({ message: 'Inventory request updated' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// Approve request: set status=1 and decrement inventory stock
router.put('/:id/approve', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [[row]] = await pool.promise().query('SELECT * FROM inventory_request WHERE id=? LIMIT 1', [id]);
    if (!row) {
    return res.status(404).json({ message: 'Not found' });
  }
    if (Number(row.status) === 1) {
      // Already approved: do nothing (idempotent)
      return res.json({ message: 'Already approved' });
    }
    await pool.promise().query('UPDATE inventory SET quantity = quantity - ? WHERE id=?', [row.quantity, row.inventory_id]);
    await pool.promise().query('UPDATE inventory_request SET status=1, updated_at=NOW() WHERE id=?', [id]);
    res.json({ message: 'Approved' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// Reject request: set status=2
router.put('/:id/reject', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await pool.promise().query('UPDATE inventory_request SET status=2, updated_at=NOW() WHERE id=?', [id]);
    res.json({ message: 'Rejected' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.promise().query('DELETE FROM inventory_request WHERE id=?', [req.params.id]);
    res.json({ message: 'Inventory request deleted' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;


