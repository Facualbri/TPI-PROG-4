const PartidosPage = {
  _fechas: [],
  _selectedFechaId: null,

  async render(main) {
    this._fechas = await Api.get('/fechas');
    if (this._fechas.length === 0) {
      main.innerHTML = '<div class="empty-state"><p>No hay fechas disponibles</p></div>';
      return;
    }

    this._selectedFechaId = Helpers.getQueryParam('fechaId') || this._fechas[0].id;
    await this._render(main);
  },

  async _render(main) {
    const partidos = await Api.get(`/partidos?fechaId=${this._selectedFechaId}`);

    const fechaActual = this._fechas.find(f => f.id === this._selectedFechaId);

    main.innerHTML = `
      <div class="page-header">
        <div>
          <h1>Partidos</h1>
          <p>Pronosticá los resultados de los partidos</p>
        </div>
      </div>

      <div class="form-group mb-md">
        <label class="form-label">Seleccionar fecha</label>
        <select id="fecha-select" class="select">
          ${this._fechas.map(f => `
            <option value="${f.id}" ${f.id === this._selectedFechaId ? 'selected' : ''}>
              ${Helpers.escapeHtml(f.nombre)} - ${Helpers.estadoLabel(f.estado)}
            </option>
          `).join('')}
        </select>
      </div>

      ${fechaActual ? `<div class="mb-md"><span class="badge ${Helpers.estadoClass(fechaActual.estado)}">${Helpers.estadoLabel(fechaActual.estado)}</span></div>` : ''}

      <div id="partidos-list">
        ${partidos.length === 0
          ? '<div class="empty-state"><p>No hay partidos en esta fecha</p></div>'
          : partidos.map(p => PartidosPage._renderPartido(p)).join('')
        }
      </div>
    `;

    document.getElementById('fecha-select').addEventListener('change', (e) => {
      this._selectedFechaId = e.target.value;
      Router.navigate(`/partidos?fechaId=${this._selectedFechaId}`);
      this._render(main);
    });

    this._bindPredictionForms();
  },

  _renderPartido(p) {
    return `
      <div class="match-card mb-md" id="partido-${p.id}">
        <div class="match-card-header">
          <span class="badge ${Helpers.estadoClass(p.estado)}">${Helpers.estadoLabel(p.estado)}</span>
          <span class="text-muted" style="font-size:0.8rem">${Helpers.formatDateShort(p.inicioUtc)}</span>
        </div>
        <div class="match-card-body">
          <div class="match-team">
            <div class="avatar avatar-sm">${Helpers.getInitials(p.equipoLocal?.nombre)}</div>
            <span class="match-team-name">${Helpers.escapeHtml(p.equipoLocal?.nombre || '')}</span>
          </div>
          <div>
            ${p.estado === 'FINALIZADO'
              ? `<div class="match-score">${p.golesLocal} - ${p.golesVisitante}</div>`
              : `<div class="match-prediction-inputs">
                  <input class="input" type="number" min="0" value="" placeholder="-" data-partido-id="${p.id}" data-equipo="local" ${p.bloqueado || p.estado !== 'POR_JUGARSE' ? 'disabled' : ''}>
                  <span class="match-vs">vs</span>
                  <input class="input" type="number" min="0" value="" placeholder="-" data-partido-id="${p.id}" data-equipo="visitante" ${p.bloqueado || p.estado !== 'POR_JUGARSE' ? 'disabled' : ''}>
                </div>`
            }
            ${p.bloqueado ? '<div class="text-muted text-center mt-sm" style="font-size:0.8rem">Bloqueado (el partido ya comenzó)</div>' : ''}
          </div>
          <div class="match-team match-team-right">
            <span class="match-team-name">${Helpers.escapeHtml(p.equipoVisitante?.nombre || '')}</span>
            <div class="avatar avatar-sm">${Helpers.getInitials(p.equipoVisitante?.nombre)}</div>
          </div>
        </div>
        ${p.estado === 'POR_JUGARSE' && !p.bloqueado ? `
        <div style="text-align:right;padding-top:var(--space-sm);border-top:1px solid var(--color-border)">
          <button class="btn btn-primary btn-sm" onclick="PartidosPage._enviarPronostico('${p.id}')">Pronosticar</button>
        </div>` : ''}
        ${p.estado !== 'POR_JUGARSE' && p.golesLocal != null ? `
        <div style="text-align:center;padding-top:var(--space-sm);border-top:1px solid var(--color-border)">
          <span class="text-muted" style="font-size:0.85rem">Resultado final: <strong>${p.golesLocal} - ${p.golesVisitante}</strong></span>
        </div>` : ''}
      </div>
    `;
  },

  _bindPredictionForms() {
    document.querySelectorAll('.match-prediction-inputs input').forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const partidoId = input.dataset.partidoId;
          PartidosPage._enviarPronostico(partidoId);
        }
      });
      input.addEventListener('input', () => {
        const partidoId = input.dataset.partidoId;
        const card = document.getElementById(`partido-${partidoId}`);
        const local = card.querySelector('input[data-equipo="local"]').value;
        const visitante = card.querySelector('input[data-equipo="visitante"]').value;
        const btn = card.querySelector('.btn');
        if (btn) {
          btn.disabled = !local || !visitante;
        }
      });
    });
  },

  async _enviarPronostico(partidoId) {
    const card = document.getElementById(`partido-${partidoId}`);
    const local = card.querySelector('input[data-equipo="local"]').value;
    const visitante = card.querySelector('input[data-equipo="visitante"]').value;

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
      Toast.success('Pronóstico guardado');
    } catch (err) {
      Toast.error(err.message);
    }
  },
};
