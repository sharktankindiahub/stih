// Logger utility for different environments
const config = require('../config');

const logger = {
  debug: (...args) => {
    if (config.logLevel === 'debug') {
      console.log('[DEBUG]', ...args);
    }
  },
  info: (...args) => {
    console.log('[INFO]', ...args);
  },
  warn: (...args) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args) => {
    console.error('[ERROR]', ...args);
  }
};

module.exports = logger;
