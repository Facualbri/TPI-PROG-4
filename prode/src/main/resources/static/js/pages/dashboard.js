const DashboardPage = {
  async render(main) {
    main.innerHTML = `
      <div class="page-header">
        <div>
          <h1>Bienvenido</h1>
          <p>Cargando tu actividad...</p>
        </div>
      </div>
      <div class="dashboard-stats">
        <div class="stat-card"><div class="skeleton skeleton-stat"></div></div>
        <div class="stat-card"><div class="skeleton skeleton-stat"></div></div>
      </div>
      <div class="page-section">
        <h2 class="page-section-title">Últimos pronósticos acertados</h2>
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card" style="margin-top:12px"></div>
      </div>
    `;

    try {
      const [recientes, pozo] = await Promise.all([
        Api.get('/pronosticos/recientes-acertados'),
        Api.get('/ranking/pozo'),
      ]);

      const user = Auth.getUser();

      main.innerHTML = `
        <div class="page-header">
          <div>
            <h1>Bienvenido, ${Helpers.escapeHtml(user?.username || '')}</h1>
            <p>Resumen de tu actividad en el Prode</p>
          </div>
        </div>

        <div class="dashboard-stats">
          <div class="stat-card">
            <div class="stat-value">${pozo?.pozoTotal ?? pozo ?? 0}</div>
            <div class="stat-label">Pozo total acumulado</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${recientes.length}</div>
            <div class="stat-label">Últimos aciertos</div>
          </div>
        </div>

        <div class="page-section">
          <h2 class="page-section-title">Últimos pronósticos acertados</h2>
          ${recientes.length === 0
            ? '<div class="empty-state"><p>Todavía no tenés pronósticos acertados. ¡Animate a pronosticar!</p></div>'
            : recientes.map(p => DashboardPage._renderPronostico(p)).join('')
          }
        </div>
      `;
    } catch (err) {
      main.innerHTML = `
        <div class="page-header">
          <div>
            <h1>Bienvenido</h1>
            <p>Resumen de tu actividad</p>
          </div>
        </div>
        <div class="alert alert-error">${Helpers.escapeHtml(err.message)}</div>
      `;
    }
  },

  _renderPronostico(p) {
    return `
      <div class="match-card mb-md">
        <div class="match-card-header">
          <span class="badge ${Helpers.estadoClass(p.estadoPartido)}">${Helpers.estadoLabel(p.estadoPartido)}</span>
          <span class="text-success font-bold" style="font-size:0.9rem">+${p.puntos ?? 0} pts</span>
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
            <div class="match-score">${p.golesLocalPred ?? '?'} - ${p.golesVisitantePred ?? '?'}</div>
            <div class="text-muted text-center" style="font-size:0.8rem">Pronosticado</div>
          </div>
          <div class="match-team match-team-right">
            <span class="match-team-name">${Helpers.escapeHtml(p.equipoVisitante?.nombre || '')}</span>
            ${p.equipoVisitante?.escudoUrl
              ? `<img class="team-escudo" src="${Helpers.escapeHtml(p.equipoVisitante.escudoUrl)}" alt="${Helpers.escapeHtml(p.equipoVisitante.nombre || '')}" loading="lazy">`
              : `<div class="avatar avatar-sm">${Helpers.getInitials(p.equipoVisitante?.nombre)}</div>`
            }
          </div>
        </div>
        ${p.puntos > 0 ? `
        <div style="text-align:center;margin-top:var(--space-sm);padding-top:var(--space-sm);border-top:1px solid var(--color-border)">
          <span class="text-success font-bold">Resultado final: ${p.golesLocal} - ${p.golesVisitante}</span>
        </div>` : ''}
      </div>
    `;
  },
};
