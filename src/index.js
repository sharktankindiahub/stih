const express = require('express');
const path = require('path');
const config = require('./config');
const apiRoutes = require('./api/routes');
const errorHandler = require('./api/middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// ═══════════════════════════════════════════════════════════════
// Middleware
// ═══════════════════════════════════════════════════════════════

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files - SPA public
app.use(express.static(path.join(__dirname, 'public')));

// ═══════════════════════════════════════════════════════════════
// API Routes
// ═══════════════════════════════════════════════════════════════

app.use('/api', apiRoutes);

// ═══════════════════════════════════════════════════════════════
// Health & Config Endpoints
// ═══════════════════════════════════════════════════════════════

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

app.get('/config', (req, res) => {
  res.json({
    environment: config.nodeEnv,
    port: config.port,
    logLevel: config.logLevel
  });
});

// ═══════════════════════════════════════════════════════════════
// SPA Fallback Route
// ═══════════════════════════════════════════════════════════════

// Serve admin panel
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin/login.html'));
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  // Don't fallback for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// ═══════════════════════════════════════════════════════════════
// Error Handling
// ═══════════════════════════════════════════════════════════════

app.use(errorHandler);

// ═══════════════════════════════════════════════════════════════
// Start Server
// ═══════════════════════════════════════════════════════════════

const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`🚀 STIH Server running on port ${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`Public: http://localhost:${PORT}`);
  logger.info(`Admin: http://localhost:${PORT}/admin`);
  logger.info(`API: http://localhost:${PORT}/api`);
});

module.exports = app;
