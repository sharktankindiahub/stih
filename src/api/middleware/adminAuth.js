// ═══════════════════════════════════════════════════════════════
// Admin Authentication Middleware
// ═══════════════════════════════════════════════════════════════

const jwt = require('jsonwebtoken');
const logger = require('../../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const adminAuth = {
  verifyToken: (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.warn('Missing authorization header');
      return res.status(401).json({ message: 'Missing authorization token' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.admin = decoded;
      next();
    } catch (error) {
      logger.warn('Token verification failed:', error.message);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  },

  generateToken: (username) => {
    return jwt.sign({ username }, JWT_SECRET, {
      expiresIn: '24h',
    });
  },
};

module.exports = adminAuth;
