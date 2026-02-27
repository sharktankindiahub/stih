require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'debug',
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/stih_dev'
  },
  api: {
    key: process.env.API_KEY || 'dev_key'
  },
  isDevelopment: () => process.env.NODE_ENV === 'development',
  isTest: () => process.env.NODE_ENV === 'test',
  isProduction: () => process.env.NODE_ENV === 'production'
};
