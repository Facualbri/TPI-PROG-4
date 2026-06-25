const RankingPage = {
  async render(main) {
    const [globalRanking, misGrupos] = await Promise.all([
      Api.get('/ranking/global'),
      Api.get('/grupos/mis-grupos'),
    ]);

    main.innerHTML = `
      <div class="page-header">
        <div>
          <h1>Ranking</h1>
          <p>Tabla de posiciones global y por grupo</p>
        </div>
      </div>

      <div class="tabs">
        <button class="tab active" data-tab="global">Global</button>
        ${misGrupos.map(g => `
          <button class="tab" data-tab="${g.id}">${Helpers.escapeHtml(g.nombre)}</button>
        `).join('')}
      </div>

      <div id="ranking-content">
        ${RankingPage._renderRankingTable(globalRanking, 'Ranking Global')}
      </div>
    `;

    main.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', async () => {
        main.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const grupoId = tab.dataset.tab;
        const container = document.getElementById('ranking-content');
        container.innerHTML = '<div class="loading-container"><div class="spinner spinner-lg"></div></div>';

        try {
          if (grupoId === 'global') {
            const ranking = await Api.get('/ranking/global');
            container.innerHTML = RankingPage._renderRankingTable(ranking, 'Ranking Global');
          } else {
            const ranking = await Api.get(`/ranking/grupo/${grupoId}`);
            const grupo = misGrupos.find(g => g.id === grupoId);
            container.innerHTML = RankingPage._renderRankingTable(ranking, grupo?.nombre || 'Grupo');
          }
        } catch (err) {
          container.innerHTML = `<div class="alert alert-error">${Helpers.escapeHtml(err.message)}</div>`;
        }
      });
    });
  },

  _renderRankingTable(ranking, title) {
    if (ranking.length === 0) {
      return `<div class="empty-state"><p>Sin datos de ranking</p></div>`;
    }

    return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">${Helpers.escapeHtml(title)}</h3>
          <span class="text-muted" style="font-size:0.85rem">${ranking.length} participante${ranking.length !== 1 ? 's' : ''}</span>
        </div>
        <table class="ranking-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Usuario</th>
              <th>Puntos</th>
              <th>Plenos</th>
            </tr>
          </thead>
          <tbody>
            ${ranking.map((r, i) => `
              <tr>
                <td><span class="rank-pos ${i < 3 ? `rank-${i + 1}` : ''}">${r.posicion}</span></td>
                <td>
                  <div class="flex items-center gap-sm">
                    <div class="avatar avatar-sm">${Helpers.getInitials(r.username)}</div>
                    <span class="font-bold">${Helpers.escapeHtml(r.username)}</span>
                  </div>
                </td>
                <td class="font-mono font-bold">${r.totalPuntos}</td>
                <td class="font-mono text-muted">${r.totalPlenos}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },
};
