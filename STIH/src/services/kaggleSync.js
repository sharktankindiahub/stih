// ═══════════════════════════════════════════════════════════════
// Kaggle Sync Service - Execute Python script to fetch Kaggle data
// ═══════════════════════════════════════════════════════════════

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');

class KaggleSyncService {
  constructor() {
    this.isRunning = false;
  }

  getTimestamp() {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const YY = String(now.getFullYear()).slice(-2);
    const HH = String(now.getHours()).padStart(2, '0');
    const MM = String(now.getMinutes()).padStart(2, '0');
    const SS = String(now.getSeconds()).padStart(2, '0');
    return `${dd}${mm}${YY}${HH}${MM}${SS}`;
  }

  async saveBackup(filename, data) {
    try {
      const backupDir = path.join(__dirname, '../data/backups');
      await fs.mkdir(backupDir, { recursive: true });
      
      const timestamp = this.getTimestamp();
      const backupFilename = filename.replace('.json', `_${timestamp}.json`);
      const backupPath = path.join(backupDir, backupFilename);
      
      await fs.writeFile(backupPath, JSON.stringify(data, null, 2), 'utf-8');
      logger.info(`Backup saved: ${backupFilename}`);
      return backupFilename;
    } catch (error) {
      logger.error('Error saving backup:', error.message);
      throw error;
    }
  }

  async syncData() {
    if (this.isRunning) {
      throw new Error('Sync already in progress');
    }

    this.isRunning = true;

    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, '../../scripts/fetch_kaggle_data.py');
      const python = spawn('python', [scriptPath], {
        cwd: path.join(__dirname, '../../'),
        env: process.env,  // Pass environment variables to Python
      });

      let stdout = '';
      let stderr = '';

      python.stdout.on('data', (data) => {
        const message = data.toString();
        stdout += message;
        logger.info('Python stdout:', message);
      });

      python.stderr.on('data', (data) => {
        const message = data.toString();
        stderr += message;
        logger.error('Python stderr:', message);
      });

      python.on('close', (code) => {
        this.isRunning = false;

        if (code === 0) {
          logger.info('Python script completed successfully');
          resolve({
            success: true,
            message: 'Data synchronized successfully from Kaggle',
            output: stdout,
          });
        } else {
          logger.error(`Python script failed with code ${code}`);
          reject(new Error(`Python script failed: ${stderr || 'Unknown error'}`));
        }
      });

      python.on('error', (err) => {
        this.isRunning = false;
        logger.error('Failed to spawn Python process:', err.message);
        reject(new Error(`Failed to execute sync: ${err.message}`));
      });
    });
  }

  isSyncing() {
    return this.isRunning;
  }
}

module.exports = new KaggleSyncService();
