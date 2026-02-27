// ═══════════════════════════════════════════════════════════════
// Helper Utilities
// ═══════════════════════════════════════════════════════════════

const helpers = {
  // Format currency
  formatCurrency(value) {
    if (!value) return '₹0';
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    }
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return `₹${value.toLocaleString()}`;
  },

  // Format percentage
  formatPercentage(value) {
    return `${parseFloat(value).toFixed(1)}%`;
  },

  // Format date
  formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  // Debounce function
  debounce(fn, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  // Generate random color
  randomColor() {
    const colors = ['#E8192C', '#22C55E', '#3B82F6', '#F5C518', '#8B5CF6', '#EC4899'];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  // Generate array of n random colors
  generateColors(n) {
    const baseColors = ['#E8192C', '#22C55E', '#3B82F6', '#F5C518', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];
    const colors = [];
    for (let i = 0; i < n; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
  },

  // Truncate text
  truncate(text, length = 50) {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  },

  // Capitalize first letter
  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // Sleep utility
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
};
