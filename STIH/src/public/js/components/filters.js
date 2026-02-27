// ═══════════════════════════════════════════════════════════════
// Filters Component - Chip-based filtering
// ═══════════════════════════════════════════════════════════════

const filters = {
  activeFilters: {},

  createChips(containerId, options, onSelect) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    const chipsHtml = options
      .map(
        (opt, idx) =>
          `<div class="chip ${idx === 0 ? 'active' : ''}" onclick="filters.selectChip(this, '${opt.value}', '${containerId}', ${onSelect})">
            ${opt.label}
          </div>`
      )
      .join('');
    container.innerHTML = chipsHtml;

    if (options.length > 0) {
      this.activeFilters[containerId] = options[0].value;
    }
  },

  selectChip(element, value, containerId, callback) {
    document.querySelectorAll(`#${containerId} .chip`).forEach(chip => chip.classList.remove('active'));
    element.classList.add('active');
    this.activeFilters[containerId] = value;

    if (typeof callback === 'function') {
      callback(value);
    }
  },

  getActive(containerId) {
    return this.activeFilters[containerId];
  },
};
