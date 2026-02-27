// ═══════════════════════════════════════════════════════════════
// Admin API Routes
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

// POST /api/admin/login
router.post('/login', (req, res, next) => adminController.login(req, res, next));

// POST /api/admin/reload (requires auth)
router.post('/reload', adminAuth.verifyToken, (req, res, next) =>
  adminController.reloadData(req, res, next)
);

// GET /api/admin/status (requires auth)
router.get('/status', adminAuth.verifyToken, (req, res, next) =>
  adminController.getStatus(req, res, next)
);

// GET /api/admin/backup-files (requires auth)
router.get('/backup-files', adminAuth.verifyToken, (req, res, next) =>
  adminController.getBackupFiles(req, res, next)
);

// GET /api/admin/backup-data/:filename (requires auth)
router.get('/backup-data/:filename', adminAuth.verifyToken, (req, res, next) =>
  adminController.getBackupData(req, res, next)
);

// GET /api/admin/raw-csv-files (requires auth)
router.get('/raw-csv-files', adminAuth.verifyToken, (req, res, next) =>
  adminController.getRawCsvFiles(req, res, next)
);

// GET /api/admin/raw-csv-data/:filename (requires auth)
router.get('/raw-csv-data/:filename', adminAuth.verifyToken, (req, res, next) =>
  adminController.getRawCsvData(req, res, next)
);

module.exports = router;
