// ═══════════════════════════════════════════════════════════════
// Theme Manager - Handles light/dark mode
// ═══════════════════════════════════════════════════════════════

const theme = {
  STORAGE_KEY: 'stih-theme',
  DARK_CLASS: 'dark',
  DEFAULT: 'dark',

  init() {
    const saved = localStorage.getItem(this.STORAGE_KEY) || this.DEFAULT;
    this.set(saved);
    this.updateToggleUI();
  },

  set(mode) {
    const html = document.documentElement;
    if (mode === 'light') {
      html.classList.add('light');
    } else {
      html.classList.remove('light');
    }
    localStorage.setItem(this.STORAGE_KEY, mode);
    this.updateToggleUI();
  },

  toggle() {
    const current = this.getCurrent();
    const newMode = current === 'light' ? 'dark' : 'light';
    this.set(newMode);
  },

  getCurrent() {
    return document.documentElement.classList.contains('light') ? 'light' : 'dark';
  },

  updateToggleUI() {
    const current = this.getCurrent();
    const darkBtn = document.getElementById('theme-dark');
    const lightBtn = document.getElementById('theme-light');

    if (darkBtn && lightBtn) {
      if (current === 'dark') {
        darkBtn.classList.add('active');
        lightBtn.classList.remove('active');
      } else {
        lightBtn.classList.add('active');
        darkBtn.classList.remove('active');
      }
    }
  },
};

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
  theme.init();
});
