// ═══════════════════════════════════════════════════════════════
// Admin API Controller
// ═══════════════════════════════════════════════════════════════

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { parse: csvParse } = require('csv-parse/sync');
const adminAuth = require('../middleware/adminAuth');
const dataService = require('../../services/dataService');
const kaggleSync = require('../../services/kaggleSync');
const logger = require('../../utils/logger');

const ADMIN_SETTINGS_PATH = path.join(__dirname, '../../config/admin-settings.json');

class AdminController {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
      }

      // Load admin settings
      const settings = await this.loadAdminSettings();
      const admin = settings.admin;

      if (!admin || admin.username !== username) {
        logger.warn(`Failed login attempt for username: ${username}`);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, admin.passwordHash);
      if (!passwordMatch) {
        logger.warn(`Failed login attempt for username: ${username}`);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate token
      const token = adminAuth.generateToken(username);
      logger.info(`Admin login successful for username: ${username}`);

      res.json({
        token,
        username,
        message: 'Login successful',
      });
    } catch (error) {
      next(error);
    }
  }

  async reloadData(req, res, next) {
    try {
      if (kaggleSync.isSyncing()) {
        return res.status(409).json({ message: 'Sync already in progress' });
      }

      logger.info('Starting Kaggle data sync...');

      // Execute sync
      const result = await kaggleSync.syncData();

      // Save backups after successful sync
      try {

        const dataDir = path.join(__dirname, '../../data');       
        
        const dataFiles = ['pitches.json', 'sharks.json', 'seasons.json', 'industries.json'];
        const backupFilenames = [];

        for (const filename of dataFiles) {
          const filepath = path.join(dataDir, filename);
          const data = await fs.readFile(filepath, 'utf-8');
          const parsedData = JSON.parse(data);
          const backupName = await kaggleSync.saveBackup(filename, parsedData);
          backupFilenames.push(backupName);
        }

        logger.info(`Backups created: ${backupFilenames.join(', ')}`);
      } catch (backupError) {
        logger.warn('Failed to create backups:', backupError.message);
        // Don't reject the whole response, just log the backup error
      }

      // Update sync log
      const syncLog = {
        lastSyncAt: new Date().toISOString(),
        status: 'success',
        recordsImported: {
          pitches: 702,
          sharks: 8,
          seasons: 5,
        },
        message: result.message,
      };

      await dataService.saveSyncLog(syncLog);
      dataService.clearCache();

      logger.info('Kaggle data sync completed successfully');
      res.json(syncLog);
    } catch (error) {
      logger.error('Sync error:', error.message);

      // Save error log
      const syncLog = {
        lastSyncAt: new Date().toISOString(),
        status: 'error',
        error: error.message,
      };

      await dataService.saveSyncLog(syncLog);

      res.status(500).json({
        message: 'Sync failed',
        error: error.message,
      });
    }
  }

  async getStatus(req, res, next) {
    try {
      const syncLog = await dataService.getSyncLog();
      const kaggleStatus = await this.testKaggleConnection();

      res.json({
        ...syncLog,
        kaggleStatus,
        message: 'Status retrieved',
      });
    } catch (error) {
      next(error);
    }
  }

  async testKaggleConnection() {
    return new Promise((resolve) => {
      const { spawn } = require('child_process');
      const pythonProcess = spawn('python', ['scripts/fetch_kaggle_data.py', 'test'], {
        cwd: path.join(__dirname, '../../..'),
        env: process.env,  // Pass environment variables to Python subprocess
      });

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        logger.debug(`[Python] ${text.trim()}`);
      });

      pythonProcess.stderr.on('data', (data) => {
        const text = data.toString();
        errorOutput += text;
        logger.warn(`[Python Error] ${text.trim()}`);
      });

      pythonProcess.on('close', (code) => {
        logger.info(`Python test process exited with code ${code}`);
        logger.debug(`Output: ${output}`);
        
        const isOnline = code === 0 && (output.includes('[OK]') && output.includes('ONLINE'));
        
        if (!isOnline) {
          logger.warn(`Kaggle API test failed. Output: ${output} | Errors: ${errorOutput}`);
        }
        
        resolve({
          status: isOnline ? 'online' : 'offline',
          message: isOnline ? 'Kaggle API is accessible' : 'Kaggle API is not accessible or credentials missing',
          debug: {
            exitCode: code,
            outputLength: output.length,
            hasError: errorOutput.length > 0
          }
        });
      });
    });
  }

  async loadAdminSettings() {
    try {
      const data = await fs.readFile(ADMIN_SETTINGS_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      logger.error('Error loading admin settings:', error.message);
      throw new Error('Failed to load admin settings');
    }
  }

  async getBackupFiles(req, res, next) {
    try {
      const backupDir = path.join(__dirname, '../../data/backups');
      let files = [];

      try {
        files = await fs.readdir(backupDir);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }

      // Filter and sort backup files
      const backupFiles = files
        .filter(file => file.endsWith('.json'))
        .map(file => ({
          name: file,
          timestamp: this.extractTimestamp(file),
        }))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

      res.json({
        files: backupFiles,
        message: `Found ${backupFiles.length} backup files`,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBackupData(req, res, next) {
    try {
      const { filename } = req.params;

      // Validate filename (prevent directory traversal)
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ message: 'Invalid filename' });
      }

      const backupPath = path.join(__dirname, '../../data/backups', filename);
      const data = await fs.readFile(backupPath, 'utf-8');
      const parsedData = JSON.parse(data);

      res.json({
        filename,
        timestamp: this.extractTimestamp(filename),
        data: parsedData,
        count: parsedData.length || 0,
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.status(404).json({ message: 'Backup file not found' });
      } else {
        next(error);
      }
    }
  }

  extractTimestamp(filename) {
    // Extract timestamp from filename (e.g., pitches_25021726123456.json)
    const match = filename.match(/(\d{10})/);
    if (match) {
      const ts = match[1];
      return `${ts.substr(0, 2)}-${ts.substr(2, 2)}-20${ts.substr(4, 2)} ${ts.substr(6, 2)}:${ts.substr(8, 2)}`;
    }
    return 'Unknown';
  }

  async getRawCsvFiles(req, res, next) {
    try {
      const rawDir = path.join(__dirname, '../../data/raw');
      let files = [];

      try {
        files = await fs.readdir(rawDir);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }

      // Filter and sort CSV files
      const csvFiles = files
        .filter(file => file.startsWith('kaggle_raw_') && file.endsWith('.csv'))
        .map(file => ({
          name: file,
          timestamp: this.extractTimestampCsv(file),
          isLatest: file === 'kaggle_raw_latest.csv',
        }))
        .sort((a, b) => {
          if (a.isLatest) return -1;
          if (b.isLatest) return 1;
          return b.timestamp.localeCompare(a.timestamp);
        });

      res.json({
        files: csvFiles,
        message: `Found ${csvFiles.length} raw data files`,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRawCsvData(req, res, next) {
    try {
      const { filename } = req.params;

      // Validate filename
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ message: 'Invalid filename' });
      }

      if (!filename.startsWith('kaggle_raw_') || !filename.endsWith('.csv')) {
        return res.status(400).json({ message: 'Invalid CSV file' });
      }

      const csvPath = path.join(__dirname, '../../data/raw', filename);

      const fileContent = fsSync.readFileSync(csvPath, 'utf-8');
      const records = csvParse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      res.json({
        filename,
        timestamp: this.extractTimestampCsv(filename),
        totalRows: records.length,
        columns: records.length > 0 ? Object.keys(records[0]) : [],
        data: records,
        message: `Loaded ${records.length} rows from ${filename}`,
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.status(404).json({ message: 'Raw CSV file not found' });
      } else {
        next(error);
      }
    }
  }

  extractTimestampCsv(filename) {
    // Extract timestamp from filename (e.g., kaggle_raw_25021726123456.csv)
    const match = filename.match(/kaggle_raw_(\d{10})/);
    if (match) {
      const ts = match[1];
      return `${ts.substr(0, 2)}-${ts.substr(2, 2)}-20${ts.substr(4, 2)} ${ts.substr(6, 2)}:${ts.substr(8, 2)}`;
    }
    if (filename === 'kaggle_raw_latest.csv') {
      return 'Latest Snapshot';
    }
    return 'Unknown';
  }
}

module.exports = new AdminController();
