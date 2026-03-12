const jwt = require('jsonwebtoken');

const signAccess = (payload) =>
  jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ACCESS_EXPIRES || '15m' });

const signRefresh = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRES || '14d' });

const requireAuth = (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: 'Missing access token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded; // { id, role, token_version, ... }
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid/expired access token' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success:false, message:'Unauthorized' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success:false, message:'Forbidden' });
  }
  next();
};

module.exports = { signAccess, signRefresh, requireAuth, requireRole };
