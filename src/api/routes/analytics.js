// ═══════════════════════════════════════════════════════════════
// Analytics API Routes
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const dataService = require('../../services/dataService');

// GET /api/analytics
router.get('/', async (req, res, next) => {
  try {
    const analytics = await dataService.getAnalytics();
    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
