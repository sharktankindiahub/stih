// ═══════════════════════════════════════════════════════════════
// Data Service - Load and cache JSON data files
// ═══════════════════════════════════════════════════════════════

const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

const DATA_DIR = path.join(__dirname, '../data');

class DataService {
  constructor() {
    this.cache = {};
  }

  async loadJSON(filename) {
    try {
      // Return cached data if available
      if (this.cache[filename]) {
        return this.cache[filename];
      }

      const filePath = path.join(DATA_DIR, filename);
      const data = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(data);

      // Cache the data
      this.cache[filename] = parsed;
      return parsed;
    } catch (error) {
      logger.error(`Error loading ${filename}:`, error.message);
      throw new Error(`Failed to load ${filename}`);
    }
  }

  clearCache(filename) {
    if (filename) {
      delete this.cache[filename];
    } else {
      this.cache = {};
    }
  }

  /**
   * Normalize the sharks array on a pitch: split any comma-joined strings
   * e.g. ["Kunal Bahl,Mohit Yadav"] → ["Kunal Bahl", "Mohit Yadav"]
   */
  _normalizeSharks(pitches) {
    return pitches.map(p => ({
      ...p,
      sharks: (p.sharks || []).flatMap(s =>
        typeof s === 'string' ? s.split(',').map(n => n.trim()).filter(Boolean) : []
      ),
    }));
  }

  async getSeasons() {
    return this.loadJSON('seasons.json');
  }

  async getSeason(id) {
    const seasons = await this.getSeasons();
    return seasons.find(s => s.id === parseInt(id));
  }

  async getPitches(filters = {}) {
    let pitches = this._normalizeSharks(await this.loadJSON('pitches.json'));

    if (filters.season) {
      pitches = pitches.filter(p => p.season === parseInt(filters.season));
    }

    if (filters.industry) {
      pitches = pitches.filter(p => p.industry === filters.industry);
    }

    // Support both 'funded'/'unfunded' and legacy 'DEAL'/'NO_DEAL'
    if (filters.status) {
      if (filters.status === 'funded' || filters.status === 'DEAL') {
        pitches = pitches.filter(p => p.funded === true);
      } else if (filters.status === 'unfunded' || filters.status === 'NO_DEAL') {
        pitches = pitches.filter(p => p.funded === false);
      }
    }

    if (filters.search) {
      const query = filters.search.toLowerCase();
      pitches = pitches.filter(p =>
        (p.name || '').toLowerCase().includes(query) ||
        (p.type || '').toLowerCase().includes(query) ||
        (p.industry || '').toLowerCase().includes(query)
      );
    }

    return pitches;
  }

  async getPitch(id) {
    const pitches = this._normalizeSharks(await this.loadJSON('pitches.json'));
    // id is a string slug like 'bluepinefoods', fallback to numeric index
    return pitches.find(p => p.id === id) || pitches.find(p => String(p.pitch) === String(id));
  }

  async getSharks() {
    return this.loadJSON('sharks.json');
  }

  async getShark(id) {
    const sharks = await this.getSharks();
    return sharks.find(s => s.id === parseInt(id));
  }

  async getIndustries() {
    return this.loadJSON('industries.json');
  }

  async getAnalytics() {
    const pitches = this._normalizeSharks(await this.loadJSON('pitches.json'));
    const industries = await this.loadJSON('industries.json');
    const seasons = await this.loadJSON('seasons.json');

    const totalPitches = pitches.length;
    const fundedPitches = pitches.filter(p => p.funded === true);
    const totalDeals = fundedPitches.length;
    // total invested in lakhs from dealAmt, convert to crores for display
    const totalInvestedLakhs = fundedPitches.reduce((sum, p) => sum + (p.dealAmt || 0), 0);
    const totalInvestedCr = Math.round(totalInvestedLakhs / 100 * 10) / 10;
    const largestDealLakhs = Math.max(...fundedPitches.map(p => p.dealAmt || 0), 0);
    const avgDealLakhs = totalDeals > 0 ? totalInvestedLakhs / totalDeals : 0;

    // Deal type breakdown
    const equity  = pitches.filter(p => p.funded && p.dealType === 'equity').length;
    const mixed   = pitches.filter(p => p.funded && p.dealType === 'mixed').length;
    const royalty = pitches.filter(p => p.funded && p.dealType === 'royalty').length;

    return {
      stats: {
        totalPitches,
        totalDeals,
        dealPercentage: Math.round((totalDeals / totalPitches) * 100),
        totalInvestedCr,
        totalInvested: totalInvestedCr, // backward compat
      },
      metrics: {
        averageDeal: Math.round(avgDealLakhs),
        averageDealCr: Math.round(avgDealLakhs / 100 * 10) / 10,
        largestDeal: largestDealLakhs,
        largestDealCr: Math.round(largestDealLakhs / 100 * 10) / 10,
        dealRate: Math.round((totalDeals / totalPitches) * 100),
      },
      charts: {
        dealBreakdown: {
          labels: ['Funded', 'No Deal'],
          values: [totalDeals, totalPitches - totalDeals],
        },
        dealTypes: {
          labels: ['Equity', 'Mixed (Debt+Equity)', 'Royalty'],
          values: [equity, mixed, royalty],
        },
        industries: {
          labels: industries.slice(0, 10).map(ind => ind.name),
          values: industries.slice(0, 10).map(ind => ind.total),
          funded: industries.slice(0, 10).map(ind => ind.funded),
        },
        seasons: {
          labels: seasons.map(s => `S${s.number}`),
          pitches: seasons.map(s => s.totalPitches),
          deals: seasons.map(s => s.dealsClosedCount),
          invested: seasons.map(s => s.investedCr),
        },
        sharkDeals: (() => {
          const sharkData = pitches.reduce((acc, p) => {
            (p.sharks || []).forEach(sh => {
              if (!acc[sh]) acc[sh] = 0;
              acc[sh]++;
            });
            return acc;
          }, {});
          const coreOrder = ['Aman','Namita','Anupam','Peyush','Vineeta','Ritesh','Amit','Kunal Bahl','Ashneer','Ashneer Grover'];
          const sorted = Object.entries(sharkData)
            .filter(([name]) => coreOrder.includes(name))
            .sort((a, b) => b[1] - a[1]);
          return {
            labels: sorted.map(x => x[0]),
            values: sorted.map(x => x[1]),
          };
        })(),
      },
      industries,
      seasons,
    };
  }

  async getSyncLog() {
    try {
      return await this.loadJSON('sync-log.json');
    } catch (error) {
      return null;
    }
  }

  async saveSyncLog(data) {
    try {
      const filePath = path.join(DATA_DIR, 'sync-log.json');
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
      this.clearCache('sync-log.json');
      return true;
    } catch (error) {
      logger.error('Error saving sync log:', error.message);
      return false;
    }
  }
}

module.exports = new DataService();
