// ═══════════════════════════════════════════════════════════════
// Pitches API Routes
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const dataService = require('../../services/dataService');

// GET /api/pitches
router.get('/', async (req, res, next) => {
  try {
    const filters = {
      season: req.query.season,
      industry: req.query.industry,
      status: req.query.status,
      search: req.query.search,
    };

    const pitches = await dataService.getPitches(filters);
    res.json(pitches);
  } catch (error) {
    next(error);
  }
});

// GET /api/pitches/:id
router.get('/:id', async (req, res, next) => {
  try {
    const pitch = await dataService.getPitch(req.params.id);
    if (!pitch) {
      return res.status(404).json({ message: 'Pitch not found' });
    }
    res.json(pitch);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
