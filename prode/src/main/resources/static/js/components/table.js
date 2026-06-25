const Table = {
  render({ columns, rows, emptyMessage = 'Sin datos' }) {
    if (!rows || rows.length === 0) {
      return `<div class="empty-state">${emptyMessage}</div>`;
    }

    return `
      <div class="table-wrapper">
        <table class="ranking-table">
          <thead>
            <tr>${columns.map(c => `<th>${c.label}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map((row, i) => `
              <tr>${columns.map(c => `<td>${c.render ? c.render(row, i) : Helpers.escapeHtml(String(row[c.key] ?? ''))}</td>`).join('')}</tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },
};
