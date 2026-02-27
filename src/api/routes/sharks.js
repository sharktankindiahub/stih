// ═══════════════════════════════════════════════════════════════
// Sharks API Routes
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const dataService = require('../../services/dataService');

// GET /api/sharks
router.get('/', async (req, res, next) => {
  try {
    const sharks = await dataService.getSharks();
    res.json(sharks);
  } catch (error) {
    next(error);
  }
});

// GET /api/sharks/:id
router.get('/:id', async (req, res, next) => {
  try {
    const shark = await dataService.getShark(req.params.id);
    if (!shark) {
      return res.status(404).json({ message: 'Shark not found' });
    }
    res.json(shark);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
