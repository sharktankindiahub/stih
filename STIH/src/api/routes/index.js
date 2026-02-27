// ═══════════════════════════════════════════════════════════════
// API Routes Registry
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();

const seasonRoutes = require('./seasons');
const pitchRoutes = require('./pitches');
const sharkRoutes = require('./sharks');
const analyticsRoutes = require('./analytics');
const adminRoutes = require('./admin');

// Mount routes
router.use('/seasons', seasonRoutes);
router.use('/pitches', pitchRoutes);
router.use('/sharks', sharkRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
