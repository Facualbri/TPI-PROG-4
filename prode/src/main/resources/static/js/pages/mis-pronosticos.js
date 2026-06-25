const MisPronosticosPage = {
  async render(main) {
    main.innerHTML = `
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

    main.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', async () => {
        main.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter;
        await MisPronosticosPage._loadPronosticos(filter);
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
        container.innerHTML = '<div class="empty-state"><p>No hay pronósticos para mostrar</p></div>';
        return;
      }

      container.innerHTML = pronosticos.map((p, i) => `
        <div class="match-card mb-md" style="animation-delay:${i * 50}ms">
          <div class="match-card-header">
            <span class="badge ${Helpers.estadoClass(p.estadoPartido)}">${Helpers.estadoLabel(p.estadoPartido)}</span>
            <span class="text-muted" style="font-size:0.8rem">${Helpers.formatDateShort(p.inicioUtc)}</span>
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
              ${p.puntos > 0 ? `<div class="text-success font-bold" style="font-size:0.9rem;text-align:center">+${p.puntos} pts</div>` : ''}
              ${p.estadoPartido === 'FINALIZADO' && p.golesLocal != null ? `
                <div class="text-muted text-center" style="font-size:0.8rem">Resultado: ${p.golesLocal} - ${p.golesVisitante}</div>
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
        </div>
      `).join('');
    } catch (err) {
      container.innerHTML = `<div class="alert alert-error">${Helpers.escapeHtml(err.message)}</div>`;
    }
  },
};
