
'use strict';

const path = require('path');
const express = require('express');
const multer = require('multer');
const { pool } = require('../../config/db');

const router = express.Router();

const uploadsDir = path.join(__dirname, '../../../uploads');
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadsDir); },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '');
    cb(null, `msg-${unique}${ext}`);
  }
});
const upload = multer({ storage });

router.get('/users', async (req, res) => {
  try {
    const name = req.query.name ? `%${req.query.name}%` : '%%';
    const [rows] = await pool.promise().query('SELECT id, full_name, email FROM users WHERE full_name LIKE ? OR email LIKE ? ORDER BY id DESC LIMIT 100', [name, name]);
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
       WHERE m.id=? AND (m.from_user_id=? OR m.to_user_id=?)
       LIMIT 1`,
      [req.params.id, req.user.id, req.user.id]
    );
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/:id/read', async (req, res) => {
  try {
    await pool.promise().query('UPDATE messages SET status=1, updated_at=NOW() WHERE id=? AND to_user_id=?', [req.params.id, req.user.id]);
    res.json({ message: 'Marked as read' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/', upload.single('attachment'), async (req, res) => {
  try {
    const { to_user_id, message } = req.body || {};
    if (req.file) {
      const crypto = require('crypto');
      const randomNum = Math.floor(Math.random() * 9999) + 1;
      const hash = crypto.createHash('sha1').update(String(randomNum)).digest('hex');
      const oldPath = req.file.path;
      const newPath = `uploads/messages/${hash}${req.file.originalname.substring(req.file.originalname.lastIndexOf('.'))}`;
      require('fs').renameSync(oldPath, newPath);
      req.file.filename = newPath.substring(newPath.indexOf('/'));
    }

    const attachmentPath = req.file ? req.file.filename : null;

    await pool.promise().query(
      'INSERT INTO messages (from_user_id, to_user_id, message, attachment, status, created_at, updated_at) VALUES (?, ?, ?, ?, 0, NOW(), NOW())',
      [req.user.id, Number(to_user_id), message, attachmentPath]
    );
    res.status(201).json({ message: 'Message sent' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;

 


