'use strict';

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const { pool } = require('../config/db');

const router = express.Router();

const rootUploads = path.join(__dirname, '../../uploads');
const messagesDir = path.join(rootUploads, 'messages');
if (!fs.existsSync(messagesDir)) fs.mkdirSync(messagesDir, { recursive: true });

function generateUniqueName(originalName) {
  const ext = path.extname(originalName || '');
  let tries = 0;
  while (tries < 100) {
    const rnd = Math.floor(Math.random() * 9999) + 1; // 1..9999
    const sha = crypto.createHash('sha1').update(String(rnd)).digest('hex');
    const name = `${sha}${ext}`;
    const fullPath = path.join(messagesDir, name);
    if (!fs.existsSync(fullPath)) {
      return { name, fullPath };
    }
    tries++;
  }
  // Fallback if too many collisions
  const fallback = `msg-${Date.now()}${ext}`;
  return { name: fallback, fullPath: path.join(messagesDir, fallback) };
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, messagesDir); },
  filename: function (req, file, cb) {
    const { name } = generateUniqueName(file?.originalname || 'file');
    cb(null, name);
  }
});
const upload = multer({ storage });

router.get('/users', async (req, res) => {
  try {
    const name = req.query.name ? `%${req.query.name}%` : '%%';
    const [rows] = await pool.promise().query('SELECT * FROM users WHERE full_name LIKE ? OR email LIKE ? ORDER BY id DESC LIMIT 100', [name, name]);
    res.json(rows);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.promise().query(
      `SELECT m.*, uf.full_name AS from_name, ut.full_name AS to_name, uf.email AS from_email, ut.email AS to_email
       FROM messages m
       JOIN users uf ON uf.id = m.from_user_id
       JOIN users ut ON ut.id = m.to_user_id
       WHERE m.from_user_id=? OR m.to_user_id=?
       ORDER BY m.id DESC`,
      [req.user.id, req.user.id]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.promise().query(
      `SELECT m.*, uf.full_name AS from_name, ut.full_name AS to_name, uf.email AS from_email, ut.email AS to_email
       FROM messages m
       JOIN users uf ON uf.id = m.from_user_id
       JOIN users ut ON ut.id = m.to_user_id
       WHERE m.id=?
       LIMIT 1`,
      [req.params.id]
    );
    if (!rows || rows.length === 0) {
    return res.status(404).json({ message: 'Not found' });
  }
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/:id/read', async (req, res) => {
  try {
    await pool.promise().query('UPDATE messages SET status=1, updated_at=NOW() WHERE id=?', [req.params.id]);
    res.json({ message: 'Marked as read' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/', upload.single('attachment'), async (req, res) => {
  try {
    const { to_user_id, message } = req.body || {};
    const attachmentPath = req.file ? `/uploads/messages/${req.file.filename}` : null;
    await pool.promise().query(
      'INSERT INTO messages (from_user_id, to_user_id, message, attachment, status, created_at, updated_at) VALUES (?, ?, ?, ?, 0, NOW(), NOW())',
      [req.user.id, Number(to_user_id), message, attachmentPath]
    );
    res.status(201).json({ message: 'Message sent' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;


