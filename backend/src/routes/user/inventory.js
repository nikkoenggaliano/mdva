'use strict';

const express = require('express');
const { pool } = require('../../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Math.min(Number(req.query.pageSize || 10), 100);
    const search = req.query.search ? req.query.search : '';
    const offset = (page - 1) * pageSize;
    const query = 'SELECT * FROM inventory WHERE name LIKE "%' + search + '%" ORDER BY id DESC LIMIT ? OFFSET ?';
    console.log(query);
    const [rows] = await pool.promise().query(
      query,
      [pageSize, offset]
    );
    console.log(rows);
    
    res.json({ data: rows, page, pageSize });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// Back-compat: create request via /request
router.post('/request', async (req, res) => {
  try {
    const { inventory_id, quantity } = req.body || {};
    const [[inv]] = await pool.promise().query('SELECT quantity FROM inventory WHERE id=? LIMIT 1', [Number(inventory_id)]);
    if (!inv) return res.status(404).json({ message: 'Inventory not found' });
    if (Number(quantity) <= 0) return res.status(400).json({ message: 'Quantity must be > 0' });
    if (Number(quantity) > Number(inv.quantity)) return res.status(400).json({ message: 'Quantity exceeds stock' });
    await pool.promise().query(
      'INSERT INTO inventory_request (user_id, inventory_id, quantity, status, created_at, updated_at) VALUES (?, ?, ?, 0, NOW(), NOW())',
      [req.user.id, Number(inventory_id), Number(quantity)]
    );
    res.status(201).json({ message: 'Request submitted' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// Create request via POST /
router.post('/', async (req, res) => {
  try {
    const { inventory_id, quantity } = req.body || {};
    const [[inv]] = await pool.promise().query('SELECT quantity FROM inventory WHERE id=? LIMIT 1', [Number(inventory_id)]);
    if (!inv) return res.status(404).json({ message: 'Inventory not found' });
    if (Number(quantity) <= 0) return res.status(400).json({ message: 'Quantity must be > 0' });
    if (Number(quantity) > Number(inv.quantity)) return res.status(400).json({ message: 'Quantity exceeds stock' });
    // Block if there is a pending request for this inventory by the same user
    const [[pending]] = await pool.promise().query('SELECT id FROM inventory_request WHERE user_id=? AND inventory_id=? AND status=0 LIMIT 1', [req.user.id, Number(inventory_id)]);
    if (pending) return res.status(400).json({ message: 'You already have a pending request for this item' });
    // Block if there is an active approved (not returned) request (status=1)
    const [[approved]] = await pool.promise().query('SELECT id FROM inventory_request WHERE user_id=? AND inventory_id=? AND status=1 LIMIT 1', [req.user.id, Number(inventory_id)]);
    if (approved) return res.status(400).json({ message: 'You must return current item before borrowing again' });
    await pool.promise().query(
      'INSERT INTO inventory_request (user_id, inventory_id, quantity, status, created_at, updated_at) VALUES (?, ?, ?, 0, NOW(), NOW())',
      [req.user.id, Number(inventory_id), Number(quantity)]
    );
    res.status(201).json({ message: 'Request submitted' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// Borrow history for current user
router.get('/history-borrow', async (req, res) => {
  try {
    const [rows] = await pool.promise().query(
      `SELECT ir.*, i.name AS inventory_name, i.unit AS inventory_unit
       FROM inventory_request ir
       LEFT JOIN inventory i ON ir.inventory_id = i.id
       WHERE ir.user_id=?
       ORDER BY ir.id DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// Alias: /history
router.get('/history', async (req, res) => {
  try {
    const [rows] = await pool.promise().query(
      `SELECT ir.*, i.name AS inventory_name, i.unit AS inventory_unit
       FROM inventory_request ir
       LEFT JOIN inventory i ON ir.inventory_id = i.id
       WHERE ir.user_id=?
       ORDER BY ir.id DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// Return an approved request (status -> 3 returned), increment stock
router.post('/return', async (req, res) => {
  try {
    const { request_id } = req.body || {};
    const [[row]] = await pool.promise().query('SELECT * FROM inventory_request WHERE id=? AND user_id=? LIMIT 1', [Number(request_id), req.user.id]);
    if (!row) return res.status(404).json({ message: 'Request not found' });
    if (Number(row.status) !== 1) return res.status(400).json({ message: 'Only approved requests can be returned' });
    await pool.promise().query('UPDATE inventory SET quantity = quantity + ? WHERE id=?', [row.quantity, row.inventory_id]);
    await pool.promise().query('UPDATE inventory_request SET status=3, updated_at=NOW() WHERE id=?', [row.id]);
    res.json({ message: 'Returned' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// PUT /api/inventory/:id/returned
router.put('/:id/returned', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [[row]] = await pool.promise().query('SELECT * FROM inventory_request WHERE id=? AND user_id=? LIMIT 1', [id, req.user.id]);
    if (!row) return res.status(404).json({ message: 'Request not found' });
    if (Number(row.status) !== 1) return res.status(400).json({ message: 'Only approved requests can be returned' });
    await pool.promise().query('UPDATE inventory SET quantity = quantity + ? WHERE id=?', [row.quantity, row.inventory_id]);
    await pool.promise().query('UPDATE inventory_request SET status=3, updated_at=NOW() WHERE id=?', [row.id]);
    res.json({ message: 'Returned' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;


