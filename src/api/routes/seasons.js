// ═══════════════════════════════════════════════════════════════
// Seasons API Routes
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const dataService = require('../../services/dataService');

// GET /api/seasons
router.get('/', async (req, res, next) => {
  try {
    const seasons = await dataService.getSeasons();
    res.json(seasons);
  } catch (error) {
    next(error);
  }
});

// GET /api/seasons/:id
router.get('/:id', async (req, res, next) => {
  try {
    const season = await dataService.getSeason(req.params.id);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }
    res.json(season);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
