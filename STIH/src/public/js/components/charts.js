// ═══════════════════════════════════════════════════════════════
// Charts Component - Wrapper for Chart.js
// ═══════════════════════════════════════════════════════════════

const charts = {
  instances: {},

  createBarChart(canvasId, labels, data, options = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.instances[canvasId]) {
      this.instances[canvasId].destroy();
    }

    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: 'var(--muted)',
          },
          grid: {
            color: 'var(--border)',
          },
        },
        x: {
          ticks: {
            color: 'var(--muted)',
          },
          grid: {
            display: false,
          },
        },
      },
    };

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Data',
            data,
            backgroundColor: 'var(--red)',
            borderRadius: 4,
          },
        ],
      },
      options: { ...defaultOptions, ...options },
    });
  },

  createDoughnutChart(canvasId, labels, data, options = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.instances[canvasId]) {
      this.instances[canvasId].destroy();
    }

    const colors = helpers.generateColors(data.length);

    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'var(--text)',
            padding: 20,
          },
        },
      },
    };

    this.instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors,
            borderColor: 'var(--card)',
            borderWidth: 2,
          },
        ],
      },
      options: { ...defaultOptions, ...options },
    });
  },

  destroyAll() {
    Object.values(this.instances).forEach(chart => chart.destroy());
    this.instances = {};
  },
};
