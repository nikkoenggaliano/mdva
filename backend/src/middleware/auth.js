'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mdva_dev_secret';

function authMiddleware(req, res, next) {
  try {
    const header = req.headers['authorization'] || '';
    const token = (header.startsWith('Bearer ') ? header.substring(7) : null) || req.cookies['token'];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const decoded = jwt.verify(token, JWT_SECRET);
    // Attach decoded token claims
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

function signJwt(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
}

module.exports = { authMiddleware, signJwt };


