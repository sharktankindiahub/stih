const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

// Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: ENV,
    timestamp: new Date().toISOString(),
  });
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Shark Tank India Hub running on port ${PORT} [${ENV}]`);
});

module.exports = app;
