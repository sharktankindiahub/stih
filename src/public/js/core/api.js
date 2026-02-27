// ═══════════════════════════════════════════════════════════════
// API Service - Handles all backend communication
// ═══════════════════════════════════════════════════════════════

const api = {
  baseUrl: '/api',
  token: localStorage.getItem('adminToken') || null,

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.token = null;
          localStorage.removeItem('adminToken');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Seasons
  async getSeasons() {
    return this.request('/seasons');
  },

  async getSeason(id) {
    return this.request(`/seasons/${id}`);
  },

  // Pitches
  async getPitches(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const endpoint = query ? `/pitches?${query}` : '/pitches';
    return this.request(endpoint);
  },

  async getPitch(id) {
    return this.request(`/pitches/${id}`);
  },

  // Sharks
  async getSharks() {
    return this.request('/sharks');
  },

  async getShark(id) {
    return this.request(`/sharks/${id}`);
  },

  // Analytics
  async getAnalytics() {
    return this.request('/analytics');
  },

  // Admin
  async adminLogin(username, password) {
    const data = await this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (data.token) {
      this.token = data.token;
      localStorage.setItem('adminToken', data.token);
    }
    return data;
  },

  async adminLogout() {
    this.token = null;
    localStorage.removeItem('adminToken');
  },

  async adminStatus() {
    return this.request('/admin/status');
  },

  async adminReloadData() {
    return this.request('/admin/reload', {
      method: 'POST',
    });
  },
};
