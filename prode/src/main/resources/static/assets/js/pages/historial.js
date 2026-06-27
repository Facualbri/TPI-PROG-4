const HistorialPage = {
  _allPronosticos: [],
  _currentPage: 1,
  _pageSize: 10,

  async render(app) {
    Navbar.render();
    const content = document.getElementById('page-content');
    content.innerHTML = '<div class="loading-container"><div class="spinner spinner-lg"></div></div>';

    try {
      this._allPronosticos = await Api.get('/pronosticos/mis-pronosticos');
      this._currentPage = 1;
      this._render(content);
    } catch (err) {
      content.innerHTML = `<div class="alert alert-error">${Helpers.escapeHtml(Helpers.getErrorMsg(err))}</div>`;
    }
  },

  _render(content) {
    const sorted = [...this._allPronosticos].sort((a, b) => new Date(b.createdAt || b.inicioUtc) - new Date(a.createdAt || a.inicioUtc));

    const totalPages = Math.max(1, Math.ceil(sorted.length / this._pageSize));
    const start = (this._currentPage - 1) * this._pageSize;
    const page = sorted.slice(start, start + this._pageSize);

    const aciertos = this._allPronosticos.filter(p => p.puntos > 0).length;
    const total = this._allPronosticos.length;
    const pct = total > 0 ? Math.round((aciertos / total) * 100) : 0;
    const totalPts = this._allPronosticos.reduce((s, p) => s + (p.puntos || 0), 0);

    content.innerHTML = `
      <div class="page-header">
        <div>
          <h1>Historial</h1>
          <p>Todos tus pronósticos con resultados y puntos</p>
        </div>
      </div>

      <div class="stats-grid" style="grid-template-columns:repeat(4,1fr)">
        <div class="stat-card">
          <div class="stat-value">${total}</div>
          <div class="stat-label">Total pronósticos</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="background:var(--color-success-gradient, linear-gradient(135deg,#22c55e,#16a34a));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${aciertos}</div>
          <div class="stat-label">Aciertos</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="background:var(--color-accent-gradient, linear-gradient(135deg,#3b82f6,#8b5cf6));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${pct}%</div>
          <div class="stat-label">Efectividad</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="background:linear-gradient(135deg,#f59e0b,#ef4444);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${totalPts}</div>
          <div class="stat-label">Puntos totales</div>
        </div>
      </div>

      <div id="historial-list">
        ${page.length === 0
          ? '<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-title">Sin actividad</div><p>Todavía no realizaste ningún pronóstico.</p></div>'
          : page.map((p, i) => `
            <div class="match-card mb-md" style="animation-delay:${i * 50}ms">
              <div class="match-card-header">
                <span class="badge ${Helpers.estadoClass(p.estadoPartido)}">${Helpers.estadoLabel(p.estadoPartido)}</span>
                <div class="flex items-center gap-sm">
                  <span class="text-muted" style="font-size:0.75rem">${Helpers.formatDateShort(p.createdAt || p.inicioUtc)}</span>
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
                  <div class="text-muted text-center" style="font-size:0.75rem">Tu pronóstico</div>
                  ${(p.estadoPartido === 'FINALIZADO' || p.estadoPartido === 'FINALIZADA') && p.golesLocal != null ? `
                    <div class="text-center mt-xs">
                      <span class="text-muted" style="font-size:0.8rem">Resultado: <strong>${p.golesLocal} - ${p.golesVisitante}</strong></span>
                      ${p.puntos > 0
                        ? '<span class="badge badge-success" style="margin-left:4px">✅</span>'
                        : '<span class="badge badge-danger" style="margin-left:4px">❌</span>'
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
            </div>
          `).join('')
        }
      </div>

      ${totalPages > 1 ? `
        <div class="pagination">
          <button class="pagination-btn" onclick="HistorialPage._goPage(${this._currentPage - 1})" ${this._currentPage <= 1 ? 'disabled' : ''}>Anterior</button>
          ${Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = i + 1;
            return `<button class="pagination-btn ${p === this._currentPage ? 'active' : ''}" onclick="HistorialPage._goPage(${p})">${p}</button>`;
          }).join('')}
          <button class="pagination-btn" onclick="HistorialPage._goPage(${this._currentPage + 1})" ${this._currentPage >= totalPages ? 'disabled' : ''}>Siguiente</button>
        </div>
      ` : ''}
    `;
  },

  _goPage(page) {
    this._currentPage = page;
    this._render(document.getElementById('page-content'));
  },
};
