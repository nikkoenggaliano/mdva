'use strict';

const express = require('express');
const crypto = require('crypto');
const { pool } = require('../config/db');
const { signJwt } = require('../middleware/auth');
const { backgroundLog } = require('../middleware/logger');

const router = express.Router();

function md5Hash(input) {
  return crypto.createHash('md5').update(String(input)).digest('hex');
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const passwordHash = md5Hash(password);
    const [rows] = await pool.promise().query(
      'SELECT * FROM users WHERE email = ? AND password = ? LIMIT 1',
      [email, passwordHash]
    );
    if (!rows || rows.length === 0) {
      backgroundLog(req, 'users doing /api/auth/login invalid-credentials');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = rows[0];
    const tokenPayload = {
      id: user.id,
      full_name: user.full_name,
      role: user.role,
      status: user.status
    };
    const token = signJwt(tokenPayload);


    console.log(user, token);

    if (user.status === 0) {
      backgroundLog(req, 'users doing /api/auth/login inactive-account');
      return res.status(401).json({ message: 'Your account is not active', token, user: tokenPayload });
    }



    res.cookie('token', token, { httpOnly: false, sameSite: 'Lax' });
    if (user.status === 2) {
      backgroundLog(req, 'users doing /api/auth/login suspended');
      return res.status(200).json({ message: 'Your account is suspended', token, user: tokenPayload });
    }

    backgroundLog(req, 'users doing /api/auth/login success');
    return res.json({ token, user: tokenPayload });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, retype_password, role } = req.body || {};
    if (!full_name || !email || !password || !retype_password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (password !== retype_password) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const [exists] = await pool.promise().query('SELECT id FROM users WHERE email=? LIMIT 1', [email]);
    if (exists && exists.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const passwordHash = md5Hash(password);
    const userRole = role || 'user';
    const now = new Date();
    const statusUser = 0; //inactive from default
    await pool.promise().query(
      'INSERT INTO users (full_name, email, password, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [full_name, email, passwordHash, userRole, statusUser]
    );

    backgroundLog(req, 'users doing /api/auth/register create');
    return res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


