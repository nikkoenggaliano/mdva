'use strict';

const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const { pool } = require('../config/db');

const router = express.Router();

function md5Hash(input) {
  return crypto.createHash('md5').update(String(input)).digest('hex');
}

// Ensure profile uploads dir exists
const rootUploads = path.join(__dirname, '../../uploads');
const profileDir = path.join(rootUploads, 'profile');
if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true });

// GET /api/profile/:id
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const me = req.user;
    // if (me.id !== id && !['admin', 'hrd'].includes(me.role)) {
    //   return res.status(403).json({ message: 'Forbidden' });
    // }
    const [rows] = await pool.promise().query('SELECT id, full_name, dob, gender, phone, address, leave_balance, salary, email, role, status, profile_picture, created_at, updated_at FROM users WHERE id=? LIMIT 1', [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// GET /api/profile?id=123
router.get('/', async (req, res) => {
  try {
    const id = Number(req.query.id);
    if (!id) {
      return res.status(400).json({ message: 'Missing id' });
    }
    const me = req.user;
    // if (me.id !== id && !['admin', 'hrd'].includes(me.role)) {
    //   return res.status(403).json({ message: 'Forbidden' });
    // }
    const [rows] = await pool.promise().query('SELECT id, full_name, dob, gender, phone, address, leave_balance, salary, email, role, status, profile_picture, created_at, updated_at FROM users WHERE id=? LIMIT 1', [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// PUT /api/profile/:id
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const me = req.user;
    // if (me.id !== id && !['admin', 'hrd'].includes(me.role)) {
    //   return res.status(403).json({ message: 'Forbidden' });
    // }
    const allowed = ['full_name', 'dob', 'gender', 'phone', 'address', 'leave_balance', 'salary'];
    const fields = [];
    const values = [];
    for (const key of allowed) {
      if (key in req.body) {
        fields.push(`${key}=?`);
        values.push(req.body[key]);
      }
    }
    if (fields.length === 0) {
      return res.json({ message: 'No changes' });
    }
    values.push(id);
    await pool.promise().query(`UPDATE users SET ${fields.join(', ')}, updated_at=NOW() WHERE id=?`, values);
    res.json({ message: 'Profile updated' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// POST /api/profile/picture (current user)
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, profileDir); },
  filename: function (req, file, cb) {
    const userId = req.user.id;
    const name = crypto.createHash('sha1').update(String(userId)).digest('hex') + '.png';
    cb(null, name);
  }
});
const upload = multer({ storage });

router.post('/picture', upload.single('picture'), async (req, res) => {
  try {
    const userId = req.user.id;
    const fileName = crypto.createHash('sha1').update(String(userId)).digest('hex') + '.png';
    const relPath = `/uploads/profile/${fileName}`;
    await pool.promise().query('UPDATE users SET profile_picture=?, updated_at=NOW() WHERE id=?', [relPath, userId]);
    res.json({ message: 'Profile picture updated', profile_picture: relPath });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// POST /api/profile/password
router.post('/password', async (req, res) => {
  try {
    const { old_password, new_password, confirm_password } = req.body || {};
    if (!old_password || !new_password || !confirm_password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (new_password !== confirm_password) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }
    const [[user]] = await pool.promise().query('SELECT id, password FROM users WHERE id=? LIMIT 1', [req.user.id]);
    if (!user) {
      return res.status(404).json({ message: 'Not found' });
    }
    if (user.password !== md5Hash(old_password)) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }
    await pool.promise().query('UPDATE users SET password=?, updated_at=NOW() WHERE id=?', [md5Hash(new_password), req.user.id]);
    res.json({ message: 'Password updated' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;


