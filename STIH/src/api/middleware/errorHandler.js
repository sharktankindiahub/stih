// ═══════════════════════════════════════════════════════════════
// Error Handler Middleware
// ═══════════════════════════════════════════════════════════════

const logger = require('../../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error:', err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500,
  });
};

module.exports = errorHandler;
