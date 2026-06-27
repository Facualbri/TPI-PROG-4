const PartidosPage = {
  _fechas: [],
  _selectedFechaId: null,
  _searchTerm: '',
  _currentPage: 1,
  _pageSize: 10,
  _allPartidos: [],

  async render(app) {
    Navbar.render();
    const content = document.getElementById('page-content');
    content.innerHTML = '<div class="loading-container"><div class="spinner spinner-lg"></div></div>';

    try {
      this._fechas = await Api.get('/fechas');
      if (this._fechas.length === 0) {
        content.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚽</div><p>No hay fechas disponibles</p></div>';
        return;
      }

      this._selectedFechaId = Helpers.getQueryParam('fechaId') || this._fechas[0].id;
      await this._loadAndRender(content);
    } catch (err) {
      content.innerHTML = `<div class="alert alert-error">${Helpers.escapeHtml(Helpers.getErrorMsg(err))}</div>`;
    }
  },

  async _loadAndRender(content) {
    content.innerHTML = `
      <div class="page-header">
        <div>
          <h1>Partidos</h1>
          <p>Pronosticá los resultados de los partidos</p>
        </div>
      </div>

      <div class="partidos-filters">
        <div class="form-group">
          <label class="form-label">Fecha</label>
          <select id="fecha-select" class="select">
            ${this._fechas.map(f => `
              <option value="${f.id}" ${f.id === this._selectedFechaId ? 'selected' : ''}>
                ${Helpers.escapeHtml(f.nombre)}
              </option>
            `).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Estado</label>
          <select id="estado-select" class="select">
            <option value="all">Todos</option>
            <option value="POR_JUGARSE">Por jugarse</option>
            <option value="EN_JUEGO">En juego</option>
            <option value="FINALIZADO">Finalizados</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Equipo</label>
          <input class="input" id="equipo-search" placeholder="Buscar equipo..." value="${Helpers.escapeHtml(this._searchTerm)}">
        </div>
      </div>

      <div id="partidos-list">${Skeleton.list(5)}</div>
    `;

    this._bindFilters(content);

    this._allPartidos = await Api.get(`/partidos?fechaId=${this._selectedFechaId}`);
    this._currentPage = 1;
    this._renderList(content);
  },

  _bindFilters(content) {
    document.getElementById('fecha-select').addEventListener('change', (e) => {
      this._selectedFechaId = e.target.value;
      Router.navigate(`/partidos?fechaId=${this._selectedFechaId}`, true);
      this._loadAndRender(content);
    });

    document.getElementById('estado-select').addEventListener('change', () => {
      this._currentPage = 1;
      this._renderList(content);
    });

    document.getElementById('equipo-search').addEventListener('input', Helpers.debounce((e) => {
      this._searchTerm = e.target.value.trim().toLowerCase();
      this._currentPage = 1;
      this._renderList(content);
    }, 300));
  },

  _getFilteredPartidos() {
    const estadoFilter = document.getElementById('estado-select')?.value || 'all';
    let filtered = [...this._allPartidos];

    if (estadoFilter !== 'all') {
      filtered = filtered.filter(p => p.estado === estadoFilter);
    }

    if (this._searchTerm) {
      const term = this._searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.equipoLocal?.nombre?.toLowerCase().includes(term) ||
        p.equipoVisitante?.nombre?.toLowerCase().includes(term)
      );
    }

    const order = { POR_JUGARSE: 0, EN_JUEGO: 1, FINALIZADO: 2, FINALIZADA: 2 };
    filtered.sort((a, b) => {
      const oA = order[a.estado] ?? 99;
      const oB = order[b.estado] ?? 99;
      if (oA !== oB) return oA - oB;
      return new Date(a.inicioUtc) - new Date(b.inicioUtc);
    });

    return filtered;
  },

  _renderList(content) {
    const container = document.getElementById('partidos-list');
    if (!container) return;

    const filtered = this._getFilteredPartidos();
    const totalPages = Math.max(1, Math.ceil(filtered.length / this._pageSize));
    const start = (this._currentPage - 1) * this._pageSize;
    const pagePartidos = filtered.slice(start, start + this._pageSize);

    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚽</div><div class="empty-state-title">Sin resultados</div><p>No se encontraron partidos con los filtros seleccionados.</p></div>';
      return;
    }

    const fechaActual = this._fechas.find(f => f.id === this._selectedFechaId);

    let html = '';
    if (fechaActual) {
      html += `<div class="flex items-center gap-sm mb-md"><span class="badge ${Helpers.estadoClass(fechaActual.estado)}">${Helpers.estadoLabel(fechaActual.estado)}</span><span class="text-muted" style="font-size:0.85rem">${Helpers.escapeHtml(fechaActual.nombre)}</span></div>`;
    }

    html += pagePartidos.map((p, i) => PartidosPage._renderPartido(p, i)).join('');

    if (totalPages > 1) {
      html += `
        <div class="pagination">
          <button class="pagination-btn" onclick="PartidosPage._goPage(${this._currentPage - 1})" ${this._currentPage <= 1 ? 'disabled' : ''}>Anterior</button>
          ${Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const page = i + 1;
            return `<button class="pagination-btn ${page === this._currentPage ? 'active' : ''}" onclick="PartidosPage._goPage(${page})">${page}</button>`;
          }).join('')}
          <button class="pagination-btn" onclick="PartidosPage._goPage(${this._currentPage + 1})" ${this._currentPage >= totalPages ? 'disabled' : ''}>Siguiente</button>
        </div>
      `;
    }

    container.innerHTML = html;
    this._bindPredictionForms();
  },

  _goPage(page) {
    this._currentPage = page;
    this._renderList(document.getElementById('page-content'));
  },

  _renderPartido(p, index) {
    const delay = (index || 0) * 60;
    return `
      <div class="match-card mb-md" id="partido-${p.id}" style="animation-delay:${delay}ms">
        <div class="match-card-header">
          <span class="badge ${Helpers.estadoClass(p.estado)}">${Helpers.estadoLabel(p.estado)}</span>
          <span class="text-muted" style="font-size:0.78rem">${Helpers.formatDateShort(p.inicioUtc)}</span>
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
            ${p.estado === 'FINALIZADO' || p.estado === 'FINALIZADA'
              ? `<div class="match-score">${p.golesLocal} - ${p.golesVisitante}</div>`
              : `<div class="match-prediction-inputs">
                  <input class="input" type="number" min="0" value="" placeholder="-" data-partido-id="${p.id}" data-equipo="local" ${p.bloqueado || (p.estado !== 'POR_JUGARSE' && p.estado !== 'PROGRAMADA') ? 'disabled' : ''}>
                  <span class="match-vs">vs</span>
                  <input class="input" type="number" min="0" value="" placeholder="-" data-partido-id="${p.id}" data-equipo="visitante" ${p.bloqueado || (p.estado !== 'POR_JUGARSE' && p.estado !== 'PROGRAMADA') ? 'disabled' : ''}>
                </div>`
            }
            ${p.bloqueado ? '<div class="text-muted text-center mt-sm" style="font-size:0.75rem">Bloqueado (el partido ya comenzó)</div>' : ''}
          </div>
          <div class="match-team match-team-right">
            <span class="match-team-name">${Helpers.escapeHtml(p.equipoVisitante?.nombre || '')}</span>
            ${p.equipoVisitante?.escudoUrl
              ? `<img class="team-escudo" src="${Helpers.escapeHtml(p.equipoVisitante.escudoUrl)}" alt="${Helpers.escapeHtml(p.equipoVisitante.nombre || '')}" loading="lazy">`
              : `<div class="avatar avatar-sm">${Helpers.getInitials(p.equipoVisitante?.nombre)}</div>`
            }
          </div>
        </div>
        ${(p.estado === 'POR_JUGARSE' || p.estado === 'PROGRAMADA') && !p.bloqueado ? `
        <div style="text-align:right;padding-top:var(--space-sm);border-top:1px solid var(--color-border)">
          <button class="btn btn-primary btn-sm" onclick="PartidosPage._enviarPronostico('${p.id}')">Pronosticar</button>
        </div>` : ''}
        ${(p.estado === 'FINALIZADO' || p.estado === 'FINALIZADA') && p.golesLocal != null ? `
        <div style="text-align:center;padding-top:var(--space-sm);border-top:1px solid var(--color-border)">
          <span class="text-muted" style="font-size:0.85rem">Resultado: <strong>${p.golesLocal} - ${p.golesVisitante}</strong></span>
        </div>` : ''}
      </div>
    `;
  },

  _bindPredictionForms() {
    document.querySelectorAll('.match-prediction-inputs input').forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          PartidosPage._enviarPronostico(input.dataset.partidoId);
        }
      });

      input.addEventListener('input', () => {
        const partidoId = input.dataset.partidoId;
        const card = document.getElementById(`partido-${partidoId}`);
        if (!card) return;
        const local = card.querySelector('input[data-equipo="local"]')?.value;
        const visitante = card.querySelector('input[data-equipo="visitante"]')?.value;
        const btn = card.querySelector('.btn');
        if (btn) btn.disabled = !local || !visitante;
      });
    });
  },

  async _enviarPronostico(partidoId) {
    const card = document.getElementById(`partido-${partidoId}`);
    if (!card) return;

    const local = card.querySelector('input[data-equipo="local"]')?.value;
    const visitante = card.querySelector('input[data-equipo="visitante"]')?.value;

    if (!local || !visitante) {
      Toast.warning('Completá ambos goles para pronosticar');
      return;
    }

    try {
      await Api.post('/pronosticos', {
        partidoId,
        golesLocalPred: parseInt(local),
        golesVisitantePred: parseInt(visitante),
      });
      Toast.success('Pronóstico guardado correctamente');
      card.querySelectorAll('input').forEach(i => i.disabled = true);
      const btn = card.querySelector('.btn');
      if (btn) btn.disabled = true;
    } catch (err) {
      Toast.error(Helpers.getErrorMsg(err));
    }
  },
};
