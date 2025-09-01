'use strict';

const express = require('express');
const axios = require('axios');
const { exec } = require('child_process');

const usersRouter = require('./users');
const eventsRouter = require('./events');
const inventoryRouter = require('./inventory');
const inventoryRequestsRouter = require('./inventoryRequests');
const leaveRequestsRouter = require('./leaveRequests');
const messagesRouter = require('./messages');
const notificationsRouter = require('./notifications');
const settingsRouter = require('./settings');
const logsRouter = require('./logs');
const toolsRouter = require('./tools');

function requireRole(roleName) {
  return (req, res, next) => {
    // check roles!
    // if (!req.user || req.user.role !== roleName) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

const router = express.Router();

router.use('/users', requireRole('admin'), usersRouter);
router.use('/events', requireRole('admin'), eventsRouter);
router.use('/inventory', requireRole('admin'), inventoryRouter);
router.use('/inventory-requests', requireRole('admin'), inventoryRequestsRouter);
router.use('/leave-requests', requireRole('admin'), leaveRequestsRouter);
router.use('/messages', requireRole('admin'), messagesRouter);
router.use('/notifications', requireRole('admin'), notificationsRouter);
router.use('/settings', requireRole('admin'), settingsRouter);
router.use('/logs', requireRole('admin'), logsRouter);
router.use('/tools', requireRole('admin'), toolsRouter);

// Execute internal commands via base64-encoded JSON payload { command: "free -m" }
router.post('/internals', requireRole('admin'), async (req, res) => {
  try {
    const { payload } = req.body || {};
    if (!payload) return res.status(400).json({ message: 'Missing payload' });
    let decoded;
    try { decoded = Buffer.from(String(payload), 'base64').toString('utf8'); } catch (_) { return res.status(400).json({ message: 'Invalid base64 payload' }); }
    let parsed;
    try { parsed = JSON.parse(decoded); } catch (_) { return res.status(400).json({ message: 'Invalid JSON payload' }); }
    const rawCmd = String(parsed.command || '').trim();
    if (!rawCmd) return res.status(400).json({ message: 'Missing command' });

    // Basic guardrails: block shell control operators
    if (/[;&`]|\|\||&&|\n/.test(rawCmd)) {
      return res.status(400).json({ message: 'Disallowed characters in command' });
    }

    // Normalize some known interactive commands
    let cmd = rawCmd;
    if (/^htop\b/.test(cmd)) cmd = 'top -b -n1';

    exec(cmd, { timeout: 7000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) return res.status(500).json({ error: String(error), stdout: String(stdout || ''), stderr: String(stderr || '') });
      // Truncate overly long outputs
      const limit = 1024 * 256;
      const out = stdout && stdout.length > limit ? stdout.slice(0, limit) + '\n...truncated...' : stdout;
      const err = stderr && stderr.length > limit ? stderr.slice(0, limit) + '\n...truncated...' : stderr;
      return res.json({ ok: true, stdout: String(out || ''), stderr: String(err || '') });
    });
  } catch (e) {
    res.status(500).json({ message: 'Internal error' });
  }
});

// Backend-assisted external fetch
router.post('/external-fetch', requireRole('admin'), async (req, res) => {
  try {
    let { url, method, headers, body } = req.body || {};
    method = (method || 'GET').toUpperCase();
    if (!url) return res.status(400).json({ message: 'Missing url' });

    // Support relative URLs (to this API)
    if (url.startsWith('/')) {
      url = `${req.protocol}://${req.get('host')}${url}`;
    }

    const started = Date.now();
    const resp = await axios({
      url,
      method,
      headers: headers || {},
      data: body,
      timeout: 8000,
      maxRedirects: 3,
      validateStatus: () => true,
    });
    const elapsedMs = Date.now() - started;
    const rawData = resp.data;
    let dataStr;
    if (typeof rawData === 'string') dataStr = rawData;
    else dataStr = JSON.stringify(rawData, null, 2);
    const limit = 1024 * 256;
    const bodyText = dataStr.length > limit ? dataStr.slice(0, limit) + '\n...truncated...' : dataStr;
    return res.json({ status: resp.status, headers: resp.headers, body: bodyText, elapsedMs });
  } catch (e) {
    return res.status(500).json({ message: 'Fetch error', error: String(e && e.message ? e.message : e) });
  }
});

module.exports = router;
 


