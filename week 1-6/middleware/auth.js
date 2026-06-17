// middleware/auth.js — JWT from Authorization header (no cookies)
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = (req.headers['authorization'] || '').split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token. Please log in.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ error: 'Admin access only.' });
  next();
};

module.exports = { authenticate, requireAdmin };
