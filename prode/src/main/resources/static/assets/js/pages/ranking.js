const RankingPage = {
  _misGrupos: [],

  async render(app) {
    Navbar.render();
    const content = document.getElementById('page-content');

    try {
      const results = await Promise.allSettled([
        Api.get('/ranking/global'),
        Api.get('/grupos/mis-grupos'),
      ]);

      const globalRanking = results[0].status === 'fulfilled' ? results[0].value : [];
      const misGrupos = results[1].status === 'fulfilled' ? results[1].value : [];

      this._misGrupos = misGrupos;

      content.innerHTML = `
        <div class="page-header">
          <div>
            <h1>Ranking</h1>
            <p>Tabla de posiciones global y por grupo</p>
          </div>
        </div>

        <div class="tabs">
          <button class="tab active" data-tab="global">🌍 Global</button>
          ${misGrupos.map(g => `
            <button class="tab" data-tab="${g.id}">${Helpers.escapeHtml(g.nombre)}</button>
          `).join('')}
        </div>

        <div id="ranking-content">
          ${RankingPage._renderRankingTable(globalRanking, 'Ranking Global')}
        </div>
      `;

      content.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', async () => {
          content.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
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
              const grupo = this._misGrupos.find(g => g.id === grupoId);
              container.innerHTML = RankingPage._renderRankingTable(ranking, grupo?.nombre || 'Grupo');
            }
          } catch (err) {
            container.innerHTML = `<div class="alert alert-error">${Helpers.escapeHtml(Helpers.getErrorMsg(err))}</div>`;
          }
        });
      });
    } catch (err) {
      content.innerHTML = `<div class="alert alert-error">${Helpers.escapeHtml(Helpers.getErrorMsg(err))}</div>`;
    }
  },

  _renderRankingTable(ranking, title) {
    if (!ranking || ranking.length === 0) {
      return `<div class="empty-state"><div class="empty-state-icon">🏆</div><div class="empty-state-title">Sin datos</div><p>No hay participantes en este ranking todavía.</p></div>`;
    }

    const medals = ['🥇', '🥈', '🥉'];

    return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">${Helpers.escapeHtml(title)}</h3>
          <span class="text-muted" style="font-size:0.85rem">${ranking.length} participante${ranking.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="table-wrapper">
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
                <tr style="animation:fadeIn 0.3s ease ${i * 50}ms both">
                  <td>
                    ${i < 3 && r.posicion <= 3
                      ? `<span class="rank-medal">${medals[r.posicion - 1]}</span>`
                      : `<span class="rank-pos">${r.posicion}</span>`
                    }
                  </td>
                  <td>
                    <div class="flex items-center gap-sm">
                      <div class="avatar avatar-sm">${Helpers.getInitials(r.username)}</div>
                      <span class="font-bold">${Helpers.escapeHtml(r.username)}</span>
                    </div>
                  </td>
                  <td class="font-mono font-bold" style="color:var(--color-primary)">${r.totalPuntos}</td>
                  <td class="font-mono text-muted">${r.totalPlenos}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },
};
