const Skeleton = {
  matchCard() {
    return `
      <div class="match-card mb-md">
        <div class="match-card-header">
          <div class="skeleton" style="width:80px;height:20px;border-radius:999px"></div>
          <div class="skeleton" style="width:100px;height:16px"></div>
        </div>
        <div class="match-card-body">
          <div class="match-team">
            <div class="skeleton skeleton-avatar"></div>
            <div class="skeleton" style="width:90px;height:16px"></div>
          </div>
          <div class="skeleton" style="width:50px;height:24px;margin:0 auto"></div>
          <div class="match-team match-team-right">
            <div class="skeleton" style="width:90px;height:16px"></div>
            <div class="skeleton skeleton-avatar"></div>
          </div>
        </div>
      </div>`;
  },

  statCard() {
    return `
      <div class="stat-card">
        <div class="skeleton" style="width:40px;height:40px;border-radius:8px;margin-bottom:12px"></div>
        <div class="skeleton" style="width:60px;height:28px;margin-bottom:4px"></div>
        <div class="skeleton" style="width:100px;height:14px"></div>
      </div>`;
  },

  tableRow(cols = 4) {
    const cells = Array.from({ length: cols }, () =>
      '<div class="skeleton" style="width:80%;height:16px"></div>'
    ).join('</td><td>');
    return `<tr><td>${cells}</td></tr>`;
  },

  card() {
    return `<div class="card"><div class="skeleton skeleton-card"></div></div>`;
  },

  text() {
    return `<div class="skeleton skeleton-text"></div>`;
  },

  title() {
    return `<div class="skeleton skeleton-title"></div>`;
  },

  list(count = 3, type = 'match') {
    const fn = this[type] || this.matchCard;
    return Array.from({ length: count }, () => fn()).join('');
  },
};
