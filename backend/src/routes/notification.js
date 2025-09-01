'use strict';

const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

// GET /api/notification/unread - list unread notifications (status=0) for current user
router.get('/unread', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const [rows] = await pool.promise().query(
      'SELECT * FROM notifications WHERE user_id=? AND status=0 ORDER BY id DESC LIMIT 50',
      [userId]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/notification/:id/read - mark as read (status=1) for current user
router.put('/:id/read', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const id = Number(req.params.id);
    await pool.promise().query('UPDATE notifications SET status=1, updated_at=NOW() WHERE id=? AND user_id=?', [id, userId]);
    res.json({ message: 'Marked as read' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


