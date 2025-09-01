'use strict';

const { pool } = require('../config/db');

function mapMethodToAction(method) {
  switch ((method || '').toUpperCase()) {
    case 'GET':
      return 'view';
    case 'POST':
      return 'create';
    case 'PUT':
    case 'PATCH':
      return 'update';
    case 'DELETE':
      return 'delete';
    default:
      return method || 'action';
  }
}

function backgroundLog(req, customNotes) {
  try {
    const userId = (req.user && req.user.id) ? Number(req.user.id) : 0;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '';
    const ua = req.headers['user-agent'] || '';
    const action = mapMethodToAction(req.method);
    const route = req.originalUrl || req.url || '';
    const notes = customNotes || `users doing ${route} ${action}`;

    // Fire-and-forget insert; do not await
    pool.query(
      'INSERT INTO log_access (user_id, ip_address, user_agent, notes, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [userId, String(ip), String(ua), String(notes)],
      () => {}
    );
  } catch (_) {
    // Swallow logging errors
  }
}

function accessLogger(req, res, next) {
  // Only log API and auth/health by default; adjust if needed
  const shouldLog = true;
  if (!shouldLog) return next();

  res.on('finish', () => {
    backgroundLog(req);
  });
  next();
}

module.exports = { accessLogger, backgroundLog };


