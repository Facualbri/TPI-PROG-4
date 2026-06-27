const MisPronosticosPage = {
  async render(app) {
    Navbar.render();
    const content = document.getElementById('page-content');

    content.innerHTML = `
      <div class="page-header">
        <div>
          <h1>Mis Pronósticos</h1>
          <p>Todos tus pronósticos registrados</p>
        </div>
      </div>
      <div class="tabs">
        <button class="tab active" data-filter="all">Todos</button>
        <button class="tab" data-filter="POR_JUGARSE">Por jugarse</button>
        <button class="tab" data-filter="EN_JUEGO">En juego</button>
        <button class="tab" data-filter="FINALIZADO">Finalizados</button>
      </div>
      <div id="pronosticos-list">
        <div class="loading-container"><div class="spinner spinner-lg"></div></div>
      </div>
    `;

    content.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', async () => {
        content.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        await MisPronosticosPage._loadPronosticos(tab.dataset.filter);
      });
    });

    await MisPronosticosPage._loadPronosticos('all');
  },

  async _loadPronosticos(filter) {
    const container = document.getElementById('pronosticos-list');
    container.innerHTML = '<div class="loading-container"><div class="spinner spinner-lg"></div></div>';

    try {
      let pronosticos;
      if (filter === 'all') {
        pronosticos = await Api.get('/pronosticos/mis-pronosticos');
      } else {
        pronosticos = await Api.get(`/pronosticos/mis-pronosticos/filtrar?estado=${filter}`);
      }

      if (pronosticos.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🎯</div><div class="empty-state-title">Sin pronósticos</div><p>No hay pronósticos para mostrar con este filtro.</p></div>';
        return;
      }

      container.innerHTML = pronosticos.map((p, i) => `
        <div class="match-card mb-md" style="animation-delay:${i * 50}ms">
          <div class="match-card-header">
            <span class="badge ${Helpers.estadoClass(p.estadoPartido)}">${Helpers.estadoLabel(p.estadoPartido)}</span>
            <div class="flex items-center gap-sm">
              <span class="text-muted" style="font-size:0.78rem">${Helpers.formatDateShort(p.inicioUtc)}</span>
              ${p.puntos > 0 ? `<span class="badge badge-success">+${p.puntos} pts</span>` : ''}
            </div>
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
              ${p.estadoPartido === 'FINALIZADO' || p.estadoPartido === 'FINALIZADA' ? `
                <div class="text-center mt-xs">
                  ${p.puntos > 0
                    ? `<span class="badge badge-success">✅ Acertado</span>`
                    : `<span class="badge badge-danger">❌ No acertado</span>`
                  }
                </div>
              ` : ''}
            </div>
            <div class="match-team match-team-right">
              <span class="match-team-name">${Helpers.escapeHtml(p.equipoVisitante?.nombre || '')}</span>
              ${p.equipoVisitante?.escudoUrl
                ? `<img class="team-escudo" src="${Helpers.escapeHtml(p.equipoVisitante.escudoUrl)}" alt="${Helpers.escapeHtml(p.equipoVisitante.nombre || '')}" loading="lazy">`
                : `<div class="avatar avatar-sm">${Helpers.getInitials(p.equipoVisitante?.nombre)}</div>`
              }
            </div>
          </div>
          ${(p.estadoPartido === 'FINALIZADO' || p.estadoPartido === 'FINALIZADA') && p.golesLocal != null ? `
          <div style="text-align:center;padding-top:var(--space-sm);border-top:1px solid var(--color-border)">
            <span class="text-muted" style="font-size:0.85rem">Resultado real: <strong>${p.golesLocal} - ${p.golesVisitante}</strong></span>
          </div>` : ''}
        </div>
      `).join('');
    } catch (err) {
      container.innerHTML = `<div class="alert alert-error">${Helpers.escapeHtml(Helpers.getErrorMsg(err))}</div>`;
    }
  },
};
