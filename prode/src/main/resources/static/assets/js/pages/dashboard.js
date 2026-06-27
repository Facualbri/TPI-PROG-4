const DashboardPage = {
  async render(app) {
    Navbar.render();

    const content = document.getElementById('page-content');
    content.innerHTML = `
      <div class="page-header">
        <div>
          <h1>Bienvenido</h1>
          <p>Cargando tu actividad...</p>
        </div>
      </div>
      <div class="stats-grid">
        ${Skeleton.statCard()}
        ${Skeleton.statCard()}
        ${Skeleton.statCard()}
        ${Skeleton.statCard()}
      </div>
      <div class="dashboard-grid">
        <div class="page-section">
          <h2 class="page-section-title">Últimos pronósticos acertados</h2>
          ${Skeleton.list(3)}
        </div>
        <div class="page-section">
          <h2 class="page-section-title">Top Ranking</h2>
          <div class="card">
            ${Skeleton.list(5, 'text')}
          </div>
        </div>
      </div>
    `;

    try {
      const results = await Promise.allSettled([
        Api.get('/pronosticos/recientes-acertados'),
        Api.get('/ranking/pozo'),
        Api.get('/ranking/global'),
      ]);

      const recientes = results[0].status === 'fulfilled' ? results[0].value : [];
      const pozo = results[1].status === 'fulfilled' ? results[1].value : 0;
      const globalRanking = results[2].status === 'fulfilled' ? results[2].value : [];

      const user = Auth.getUser();
      const userRanking = globalRanking.find(r => r.username === user?.username);
      const userPos = userRanking?.posicion || '-';
      const totalPreds = await DashboardPage._getTotalPronosticos();

      content.innerHTML = `
        <div class="page-header">
          <div>
            <h1>Bienvenido, ${Helpers.escapeHtml(user?.username || '')}</h1>
            <p>Resumen de tu actividad en el Prode</p>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <div class="stat-value">${totalPreds}</div>
            <div class="stat-label">Pronósticos realizados</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-icon" style="background:rgba(34,197,94,0.12);color:var(--color-success)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <div class="stat-value">${recientes.length}</div>
            <div class="stat-label">Últimos aciertos</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-icon" style="background:rgba(59,130,246,0.12);color:var(--color-accent)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
            </div>
            <div class="stat-value">${pozo?.pozoTotal ?? pozo ?? 0}</div>
            <div class="stat-label">Pozo total acumulado</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-icon" style="background:rgba(245,158,11,0.12);color:var(--color-warning)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6-7 6 7"/><path d="M6 19h12"/><path d="M6 15h12"/></svg>
            </div>
            <div class="stat-value">#${userPos}</div>
            <div class="stat-label">Tu posición en el ranking</div>
          </div>
        </div>

        <div class="dashboard-grid">
          <div class="page-section">
            <h2 class="page-section-title">Últimos pronósticos acertados</h2>
            ${recientes.length === 0
              ? '<div class="empty-state"><div class="empty-state-icon">🎯</div><div class="empty-state-title">Sin aciertos aún</div><p>Todavía no tenés pronósticos acertados. ¡Animate a pronosticar!</p></div>'
              : `<div class="dashboard-recent-predictions">${recientes.map(p => DashboardPage._renderPronostico(p)).join('')}</div>`
            }
          </div>
          <div class="page-section">
            <h2 class="page-section-title">Top Ranking</h2>
            <div class="card">
              ${globalRanking.length === 0
                ? '<div class="empty-state"><p>Sin datos de ranking</p></div>'
                : `<div style="padding:0">${globalRanking.slice(0, 10).map((r, i) => `
                  <div class="ranking-mini-item">
                    <span class="ranking-mini-pos">${i < 3 ? ['🥇','🥈','🥉'][i] : r.posicion}</span>
                    <span class="ranking-mini-user">${Helpers.escapeHtml(r.username)}</span>
                    <span class="ranking-mini-pts">${r.totalPuntos} pts</span>
                  </div>
                `).join('')}</div>`
              }
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      content.innerHTML = `
        <div class="page-header">
          <div>
            <h1>Bienvenido</h1>
            <p>Resumen de tu actividad</p>
          </div>
        </div>
        <div class="alert alert-error">${Helpers.escapeHtml(Helpers.getErrorMsg(err))}</div>
      `;
    }
  },

  async _getTotalPronosticos() {
    try {
      const pronosticos = await Api.get('/pronosticos/mis-pronosticos');
      return pronosticos.length;
    } catch {
      return 0;
    }
  },

  _renderPronostico(p) {
    const acierto = p.puntos > 0;
    const mostrarResultado = p.estadoPartido === 'FINALIZADO' && p.golesLocal != null;

    return `
      <div class="match-card">
        <div class="match-card-header">
          <span class="badge ${Helpers.estadoClass(p.estadoPartido)}">${Helpers.estadoLabel(p.estadoPartido)}</span>
          ${acierto ? `<span class="badge badge-success">+${p.puntos} pts</span>` : ''}
        </div>
        <div class="match-card-body">
          <div class="match-team">
            ${p.equipoLocal?.escudoUrl
              ? `<img class="team-escudo" src="${Helpers.escapeHtml(p.equipoLocal.escudoUrl)}" alt="${Helpers.escapeHtml(p.equipoLocal.nombre || '')}" loading="lazy">`
              : `<div class="avatar avatar-sm">${Helpers.getInitials(p.equipoLocal?.nombre)}</div>`
            }
            <span class="match-team-name">${Helpers.escapeHtml(p.equipoLocal?.nombre || '')}</span>
          </div>
          <div>
            <div class="match-score">${p.golesLocalPred} - ${p.golesVisitantePred}</div>
            <div class="text-muted text-center" style="font-size:0.75rem">Pronosticado</div>
          </div>
          <div class="match-team match-team-right">
            <span class="match-team-name">${Helpers.escapeHtml(p.equipoVisitante?.nombre || '')}</span>
            ${p.equipoVisitante?.escudoUrl
              ? `<img class="team-escudo" src="${Helpers.escapeHtml(p.equipoVisitante.escudoUrl)}" alt="${Helpers.escapeHtml(p.equipoVisitante.nombre || '')}" loading="lazy">`
              : `<div class="avatar avatar-sm">${Helpers.getInitials(p.equipoVisitante?.nombre)}</div>`
            }
          </div>
        </div>
        ${mostrarResultado ? `
        <div style="text-align:center;padding-top:var(--space-sm);border-top:1px solid var(--color-border)">
          <span class="match-result-badge ${acierto ? 'text-success' : 'text-muted'}">
            ${acierto ? '✅' : '❌'} Resultado: ${p.golesLocal} - ${p.golesVisitante}
          </span>
        </div>` : ''}
      </div>
    `;
  },
};
