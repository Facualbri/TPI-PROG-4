const ChartHelper = {
  _charts: {},

  create(canvasId, config) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    if (this._charts[canvasId]) {
      this._charts[canvasId].destroy();
    }
    try {
      this._charts[canvasId] = new Chart(canvas, config);
      return this._charts[canvasId];
    } catch {
      return null;
    }
  },

  destroy(canvasId) {
    if (this._charts[canvasId]) {
      this._charts[canvasId].destroy();
      delete this._charts[canvasId];
    }
  },

  destroyAll() {
    Object.keys(this._charts).forEach(id => this.destroy(id));
  },

  defaultOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#94a3b8',
            font: { family: 'Inter, sans-serif', size: 12 },
          },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(51, 65, 85, 0.5)' },
          ticks: { color: '#64748b', font: { family: 'Inter, sans-serif' } },
        },
        y: {
          grid: { color: 'rgba(51, 65, 85, 0.5)' },
          ticks: { color: '#64748b', font: { family: 'Inter, sans-serif' } },
          beginAtZero: true,
        },
      },
    };
  },
};
