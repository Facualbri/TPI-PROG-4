const AdminPage = {
  cleanup() {
    ChartHelper.destroyAll();
  },
  async render(app) {
    Navbar.render();
    const content = document.getElementById('page-content');

    if (!Auth.isAdmin()) {
      Router.navigate('/dashboard');
      return;
    }

    content.innerHTML = `
      <div class="page-header">
        <div>
          <h1>Panel de Administración</h1>
          <p>Gestión completa del sistema</p>
        </div>
      </div>

      <div class="tabs">
        <button class="tab active" data-section="dashboard">📊 Dashboard</button>
        <button class="tab" data-section="equipos">⚽ Equipos</button>
        <button class="tab" data-section="fechas">📅 Fechas</button>
        <button class="tab" data-section="partidos">🏟 Partidos</button>
        <button class="tab" data-section="resultados">🎯 Resultados</button>
        <button class="tab" data-section="ranking">🏆 Ranking</button>
      </div>

      <div id="admin-content">
        <div class="loading-container"><div class="spinner spinner-lg"></div></div>
      </div>
    `;

    content.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', async () => {
        content.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        await AdminPage._loadSection(tab.dataset.section);
      });
    });

    await AdminPage._loadSection('dashboard');
  },

  async _loadSection(section) {
    const container = document.getElementById('admin-content');
    container.innerHTML = '<div class="loading-container"><div class="spinner spinner-lg"></div></div>';

    try {
      if (section === 'dashboard') await AdminPage._renderDashboard(container);
      else if (section === 'equipos') await AdminPage._renderEquipos(container);
      else if (section === 'fechas') await AdminPage._renderFechas(container);
      else if (section === 'partidos') await AdminPage._renderPartidos(container);
      else if (section === 'resultados') await AdminPage._renderResultados(container);
      else if (section === 'ranking') await AdminPage._renderRanking(container);
    } catch (err) {
      container.innerHTML = `<div class="alert alert-error">${Helpers.escapeHtml(Helpers.getErrorMsg(err))}</div>`;
    }
  },

  // ─── DASHBOARD ────────────────────────────────
  async _renderDashboard(container) {
    const [equipos, fechas, globalRanking] = await Promise.all([
      Api.get('/equipos').catch(() => []),
      Api.get('/fechas').catch(() => []),
      Api.get('/ranking/global').catch(() => []),
    ]);

    const totalPartidos = fechas.length > 0
      ? (await Promise.all(fechas.slice(0, 3).map(f =>
          Api.get(`/partidos?fechaId=${f.id}`).catch(() => [])
        ))).flat().length
      : 0;

    container.innerHTML = `
      <div class="admin-dashboard-grid">
        <div class="admin-stat-card">
          <div class="admin-stat-value">${globalRanking.length}</div>
          <div class="admin-stat-label">Usuarios</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-value" style="color:var(--color-accent)">${equipos.length}</div>
          <div class="admin-stat-label">Equipos</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-value" style="color:var(--color-warning)">${fechas.length}</div>
          <div class="admin-stat-label">Fechas</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-value" style="color:var(--color-primary)">${totalPartidos}</div>
          <div class="admin-stat-label">Partidos</div>
        </div>
      </div>

      <div class="admin-chart-container">
        <h3 style="margin-bottom:var(--space-md);font-size:1rem;font-weight:600">Ranking Global — Top 10</h3>
        <canvas id="admin-ranking-chart"></canvas>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Top 5 del Ranking</h3>
        </div>
        <div class="table-wrapper">
          <table class="ranking-table">
            <thead>
              <tr><th>#</th><th>Usuario</th><th>Puntos</th><th>Plenos</th></tr>
            </thead>
            <tbody>
              ${globalRanking.slice(0, 5).map((r, i) => `
                <tr>
                  <td><span class="rank-pos">${r.posicion}</span></td>
                  <td><div class="flex items-center gap-sm"><div class="avatar avatar-sm">${Helpers.getInitials(r.username)}</div><span class="font-bold">${Helpers.escapeHtml(r.username)}</span></div></td>
                  <td class="font-mono font-bold" style="color:var(--color-primary)">${r.totalPuntos}</td>
                  <td class="font-mono text-muted">${r.totalPlenos}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    setTimeout(() => {
      const top10 = globalRanking.slice(0, 10);
      ChartHelper.create('admin-ranking-chart', {
        type: 'bar',
        data: {
          labels: top10.map(r => r.username),
          datasets: [{
            label: 'Puntos',
            data: top10.map(r => r.totalPuntos),
            backgroundColor: top10.map((_, i) =>
              i === 0 ? '#22c55e' : i === 1 ? '#3b82f6' : i === 2 ? '#f59e0b' : '#64748b'
            ),
            borderRadius: 6,
          }],
        },
        options: {
          ...ChartHelper.defaultOptions(),
          plugins: {
            legend: { display: false },
          },
        },
      });
    }, 100);
  },

  // ─── EQUIPOS ──────────────────────────────────
  async _renderEquipos(container) {
    const equipos = await Api.get('/equipos');

    container.innerHTML = `
      <div class="admin-section">
        <div class="admin-section-header">
          <h2>Equipos (${equipos.length})</h2>
          <button class="btn btn-primary" onclick="AdminPage._showCrearEquipo()">+ Nuevo equipo</button>
        </div>
        <div class="card">
          <div class="table-wrapper">
            <table class="ranking-table">
              <thead>
                <tr><th></th><th>Nombre</th><th>País</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                ${equipos.map(e => `
                  <tr>
                    <td>${e.escudoUrl ? `<img class="team-escudo" src="${Helpers.escapeHtml(e.escudoUrl)}" alt="${Helpers.escapeHtml(e.nombre)}" loading="lazy" style="width:28px;height:28px">` : `<div class="avatar avatar-sm">${Helpers.getInitials(e.nombre)}</div>`}</td>
                    <td class="font-bold">${Helpers.escapeHtml(e.nombre)}</td>
                    <td class="text-muted">${Helpers.escapeHtml(e.pais || '-')}</td>
                    <td>
                      <div class="admin-actions">
                        <button class="btn btn-secondary btn-sm" onclick="AdminPage._showEditarEquipo('${e.id}', '${Helpers.escapeHtml(e.nombre).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}', '${Helpers.escapeHtml(e.pais || '').replace(/\\/g, "\\\\").replace(/'/g, "\\'")}', '${Helpers.escapeHtml(e.escudoUrl || '').replace(/\\/g, "\\\\").replace(/'/g, "\\'")}')">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="AdminPage._eliminarEquipo('${e.id}')">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  _showCrearEquipo() {
    Swal.fire({
      title: 'Nuevo equipo',
      html: `
        <div style="text-align:left">
          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label">Nombre</label>
            <input class="input" id="eq-nombre" placeholder="Ej: Argentina" style="margin-top:4px">
          </div>
          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label">País</label>
            <input class="input" id="eq-pais" placeholder="Ej: Argentina" style="margin-top:4px">
          </div>
          <div class="form-group">
            <label class="form-label">URL del escudo</label>
            <input class="input" id="eq-escudo" type="url" placeholder="https://..." style="margin-top:4px">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      background: '#1e293b',
      color: '#f8fafc',
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#64748b',
      preConfirm: async () => {
        const nombre = document.getElementById('eq-nombre')?.value;
        if (!nombre) { Swal.showValidationMessage('El nombre es obligatorio'); return false; }
        return { nombre, pais: document.getElementById('eq-pais')?.value || undefined, escudoUrl: document.getElementById('eq-escudo')?.value || undefined };
      },
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          await Api.post('/equipos', result.value);
          Toast.success('Equipo creado');
          AdminPage._loadSection('equipos');
        } catch (err) {
          Toast.error(Helpers.getErrorMsg(err));
        }
      }
    });
  },

  _showEditarEquipo(id, nombre, pais, escudoUrl) {
    Swal.fire({
      title: 'Editar equipo',
      html: `
        <div style="text-align:left">
          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label">Nombre</label>
            <input class="input" id="eq-nombre-edit" value="${Helpers.escapeHtml(nombre)}" style="margin-top:4px">
          </div>
          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label">País</label>
            <input class="input" id="eq-pais-edit" value="${Helpers.escapeHtml(pais)}" style="margin-top:4px">
          </div>
          <div class="form-group">
            <label class="form-label">URL del escudo</label>
            <input class="input" id="eq-escudo-edit" type="url" value="${Helpers.escapeHtml(escudoUrl)}" style="margin-top:4px">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      background: '#1e293b',
      color: '#f8fafc',
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#64748b',
      preConfirm: async () => {
        const newNombre = document.getElementById('eq-nombre-edit')?.value;
        if (!newNombre) { Swal.showValidationMessage('El nombre es obligatorio'); return false; }
        return { nombre: newNombre, pais: document.getElementById('eq-pais-edit')?.value || undefined, escudoUrl: document.getElementById('eq-escudo-edit')?.value || undefined };
      },
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          await Api.put(`/equipos/${id}`, result.value);
          Toast.success('Equipo actualizado');
          AdminPage._loadSection('equipos');
        } catch (err) {
          Toast.error(Helpers.getErrorMsg(err));
        }
      }
    });
  },

  async _eliminarEquipo(id) {
    const result = await Swal.fire({
      title: 'Eliminar equipo',
      text: '¿Estás seguro de eliminar este equipo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      background: '#1e293b',
      color: '#f8fafc',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
    });

    if (result.isConfirmed) {
      try {
        await Api.del(`/equipos/${id}`);
        Toast.success('Equipo eliminado');
        AdminPage._loadSection('equipos');
      } catch (err) {
        Toast.error(Helpers.getErrorMsg(err));
      }
    }
  },

  // ─── FECHAS ──────────────────────────────────
  async _renderFechas(container) {
    const fechas = await Api.get('/fechas');

    container.innerHTML = `
      <div class="admin-section">
        <div class="admin-section-header">
          <h2>Fechas (${fechas.length})</h2>
          <button class="btn btn-primary" onclick="AdminPage._showCrearFecha()">+ Nueva fecha</button>
        </div>
        <div class="card">
          <div class="table-wrapper">
            <table class="ranking-table">
              <thead>
                <tr><th>Nombre</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                ${fechas.map(f => `
                  <tr>
                    <td class="font-bold">${Helpers.escapeHtml(f.nombre)}</td>
                    <td><span class="badge ${Helpers.estadoClass(f.estado)}">${Helpers.estadoLabel(f.estado)}</span></td>
                    <td>
                      <div class="admin-actions">
                        <button class="btn btn-secondary btn-sm" onclick="AdminPage._showEditarFecha('${f.id}', '${Helpers.escapeHtml(f.nombre).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}')">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="AdminPage._eliminarFecha('${f.id}')">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  _showCrearFecha() {
    Swal.fire({
      title: 'Nueva fecha',
      html: `
        <div style="text-align:left">
          <div class="form-group">
            <label class="form-label">Nombre</label>
            <input class="input" id="fecha-nombre" placeholder="Ej: Fecha 1" style="margin-top:4px">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      background: '#1e293b',
      color: '#f8fafc',
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#64748b',
      preConfirm: async () => {
        const nombre = document.getElementById('fecha-nombre')?.value;
        if (!nombre) { Swal.showValidationMessage('El nombre es obligatorio'); return false; }
        return { nombre };
      },
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          await Api.post('/fechas', result.value);
          Toast.success('Fecha creada');
          AdminPage._loadSection('fechas');
        } catch (err) {
          Toast.error(Helpers.getErrorMsg(err));
        }
      }
    });
  },

  _showEditarFecha(id, nombre) {
    Swal.fire({
      title: 'Editar fecha',
      html: `
        <div style="text-align:left">
          <div class="form-group">
            <label class="form-label">Nombre</label>
            <input class="input" id="fecha-nombre-edit" value="${Helpers.escapeHtml(nombre)}" style="margin-top:4px">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      background: '#1e293b',
      color: '#f8fafc',
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#64748b',
      preConfirm: async () => {
        const newNombre = document.getElementById('fecha-nombre-edit')?.value;
        if (!newNombre) { Swal.showValidationMessage('El nombre es obligatorio'); return false; }
        return { nombre: newNombre };
      },
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          await Api.put(`/fechas/${id}`, result.value);
          Toast.success('Fecha actualizada');
          AdminPage._loadSection('fechas');
        } catch (err) {
          Toast.error(Helpers.getErrorMsg(err));
        }
      }
    });
  },

  async _eliminarFecha(id) {
    const result = await Swal.fire({
      title: 'Eliminar fecha',
      text: '¿Estás seguro de eliminar esta fecha?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      background: '#1e293b',
      color: '#f8fafc',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
    });
    if (result.isConfirmed) {
      try {
        await Api.del(`/fechas/${id}`);
        Toast.success('Fecha eliminada');
        AdminPage._loadSection('fechas');
      } catch (err) {
        Toast.error(Helpers.getErrorMsg(err));
      }
    }
  },

  // ─── PARTIDOS ────────────────────────────────
  async _renderPartidos(container) {
    const [fechas, equipos] = await Promise.all([
      Api.get('/fechas').catch(() => []),
      Api.get('/equipos').catch(() => []),
    ]);

    State.setFechas(fechas);
    State.setEquipos(equipos);

    let partidos = [];
    let selectedFechaId = fechas.length > 0 ? fechas[0].id : null;
    if (selectedFechaId) {
      partidos = await Api.get(`/partidos?fechaId=${selectedFechaId}`);
    }

    container.innerHTML = `
      <div class="admin-section">
        <div class="admin-section-header">
          <h2>Partidos</h2>
          <button class="btn btn-primary" onclick="AdminPage._showCrearPartido()">+ Nuevo partido</button>
          <button class="btn btn-warning" onclick="AdminPage._transicionarEstados()">Actualizar estados</button>
        </div>

        <div class="partidos-filters">
          <div class="form-group">
            <label class="form-label">Filtrar por fecha</label>
            <select id="admin-fecha-select" class="select">
              ${fechas.map(f => `<option value="${f.id}">${Helpers.escapeHtml(f.nombre)}</option>`).join('')}
            </select>
          </div>
          <button class="btn btn-accent" onclick="AdminPage._importarDesdeAPI()" style="margin-top:auto">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Importar desde API
          </button>
        </div>

        <div id="admin-partidos-list">
          ${partidos.length === 0
            ? '<div class="empty-state"><p>No hay partidos en esta fecha</p></div>'
            : partidos.map((p, i) => AdminPage._renderAdminPartido(p, i)).join('')
          }
        </div>
      </div>
    `;

    document.getElementById('admin-fecha-select').addEventListener('change', async (e) => {
      const lista = document.getElementById('admin-partidos-list');
      lista.innerHTML = '<div class="loading-container"><div class="spinner"></div></div>';
      try {
        const nuevos = await Api.get(`/partidos?fechaId=${e.target.value}`);
        lista.innerHTML = nuevos.length === 0
          ? '<div class="empty-state"><p>No hay partidos en esta fecha</p></div>'
          : nuevos.map((p, i) => AdminPage._renderAdminPartido(p, i)).join('');
      } catch (err) {
        lista.innerHTML = `<div class="alert alert-error">${Helpers.escapeHtml(Helpers.getErrorMsg(err))}</div>`;
      }
    });
  },

  _renderAdminPartido(p, index) {
    return `
      <div class="match-card mb-md" style="animation-delay:${(index || 0) * 50}ms">
        <div class="match-card-header">
          <span class="badge ${Helpers.estadoClass(p.estado)}">${Helpers.estadoLabel(p.estado)}</span>
          <div class="flex gap-sm">
            ${(p.estado === 'POR_JUGARSE' || p.estado === 'PROGRAMADA') ? `
              <button class="btn btn-warning btn-sm" onclick="AdminPage._iniciarPartido('${p.id}')">Iniciar</button>
            ` : ''}
            ${p.estado === 'EN_JUEGO' ? `
              <button class="btn btn-success btn-sm" onclick="AdminPage._cargarResultado('${p.id}')">Resultado</button>
            ` : ''}
            <button class="btn btn-secondary btn-sm" onclick="AdminPage._showEditarPartido('${p.id}')">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="AdminPage._eliminarPartido('${p.id}')">Eliminar</button>
          </div>
        </div>
        <div class="match-card-body">
          <div class="match-team">
            ${p.equipoLocal?.escudoUrl ? `<img class="team-escudo" src="${Helpers.escapeHtml(p.equipoLocal.escudoUrl)}" alt="${Helpers.escapeHtml(p.equipoLocal.nombre || '')}" loading="lazy">` : `<div class="avatar avatar-sm">${Helpers.getInitials(p.equipoLocal?.nombre)}</div>`}
            <span class="match-team-name">${Helpers.escapeHtml(p.equipoLocal?.nombre || '')}</span>
          </div>
          <div>
            ${p.estado === 'FINALIZADO' || p.estado === 'FINALIZADA'
              ? `<div class="match-score">${p.golesLocal} - ${p.golesVisitante}</div>`
              : '<div class="match-vs">vs</div>'
            }
            <div class="text-muted text-center" style="font-size:0.75rem">${Helpers.formatDateShort(p.inicioUtc)}</div>
          </div>
          <div class="match-team match-team-right">
            <span class="match-team-name">${Helpers.escapeHtml(p.equipoVisitante?.nombre || '')}</span>
            ${p.equipoVisitante?.escudoUrl ? `<img class="team-escudo" src="${Helpers.escapeHtml(p.equipoVisitante.escudoUrl)}" alt="${Helpers.escapeHtml(p.equipoVisitante.nombre || '')}" loading="lazy">` : `<div class="avatar avatar-sm">${Helpers.getInitials(p.equipoVisitante?.nombre)}</div>`}
          </div>
        </div>
      </div>
    `;
  },

  _showCrearPartido() {
    if (State.data.fechas.length === 0 || State.data.equipos.length === 0) {
      Toast.warning('Necesitás fechas y equipos para crear partidos');
      return;
    }

    Swal.fire({
      title: 'Nuevo partido',
      html: `
        <div style="text-align:left">
          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label">Fecha</label>
            <select class="select" id="partido-fecha" style="margin-top:4px">
              ${State.data.fechas.map(f => `<option value="${f.id}">${Helpers.escapeHtml(f.nombre)}</option>`).join('')}
            </select>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
            <div class="form-group">
              <label class="form-label">Equipo local</label>
              <select class="select" id="partido-local" style="margin-top:4px">
                ${State.data.equipos.map(e => `<option value="${e.id}">${Helpers.escapeHtml(e.nombre)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Equipo visitante</label>
              <select class="select" id="partido-visitante" style="margin-top:4px">
                ${State.data.equipos.map(e => `<option value="${e.id}">${Helpers.escapeHtml(e.nombre)}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Inicio (fecha y hora local)</label>
            <input class="input" id="partido-inicio" type="datetime-local" style="margin-top:4px">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      background: '#1e293b',
      color: '#f8fafc',
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#64748b',
      preConfirm: async () => {
        const fechaId = document.getElementById('partido-fecha')?.value;
        const equipoLocalId = document.getElementById('partido-local')?.value;
        const equipoVisitanteId = document.getElementById('partido-visitante')?.value;
        const inicioLocal = document.getElementById('partido-inicio')?.value;

        if (!fechaId || !equipoLocalId || !equipoVisitanteId || !inicioLocal) {
          Swal.showValidationMessage('Completá todos los campos');
          return false;
        }
        if (equipoLocalId === equipoVisitanteId) {
          Swal.showValidationMessage('Los equipos deben ser distintos');
          return false;
        }
        return { fechaId, equipoLocalId, equipoVisitanteId, inicioUtc: new Date(inicioLocal).toISOString() };
      },
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          await Api.post('/partidos', result.value);
          Toast.success('Partido creado');
          AdminPage._loadSection('partidos');
        } catch (err) {
          Toast.error(Helpers.getErrorMsg(err));
        }
      }
    });
  },

  _showEditarPartido(id) {
    Toast.info('Funcionalidad de edición disponible próximamente');
  },

  async _iniciarPartido(id) {
    try {
      await Api.patch(`/partidos/${id}/en-juego`);
      Toast.success('Partido iniciado');
      AdminPage._loadSection('partidos');
    } catch (err) {
      Toast.error(Helpers.getErrorMsg(err));
    }
  },

  async _eliminarPartido(id) {
    const result = await Swal.fire({
      title: 'Eliminar partido',
      text: '¿Estás seguro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      background: '#1e293b',
      color: '#f8fafc',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
    });
    if (result.isConfirmed) {
      try {
        await Api.del(`/partidos/${id}`);
        Toast.success('Partido eliminado');
        AdminPage._loadSection('partidos');
      } catch (err) {
        Toast.error(Helpers.getErrorMsg(err));
      }
    }
  },

  _importarDesdeAPI() {
    Toast.info('Sincronización con API externa iniciada...');
  },

  // ─── RESULTADOS ──────────────────────────────
  async _renderResultados(container) {
    const fechas = await Api.get('/fechas');
    let partidosEnJuego = [];

    if (fechas.length > 0) {
      const todos = await Promise.all(
        fechas.slice(0, 3).map(f =>
          Api.get(`/partidos?fechaId=${f.id}`).catch(() => [])
        )
      );
      partidosEnJuego = todos.flat().filter(p => p.estado === 'EN_JUEGO');
    }

    container.innerHTML = `
      <div class="admin-section">
        <div class="admin-section-header">
          <h2>Cargar resultados</h2>
          <span class="badge badge-warning">${partidosEnJuego.length} en juego</span>
        </div>
        ${partidosEnJuego.length === 0
          ? '<div class="empty-state"><div class="empty-state-icon">🎯</div><div class="empty-state-title">Sin partidos en juego</div><p>No hay partidos en juego para cargar resultados.</p></div>'
          : partidosEnJuego.map(p => `
            <div class="match-card mb-md" id="resultado-${p.id}">
              <div class="match-card-header">
                <span class="badge badge-warning">En juego</span>
              </div>
              <div class="match-card-body">
                <div class="match-team">
                  ${p.equipoLocal?.escudoUrl ? `<img class="team-escudo" src="${Helpers.escapeHtml(p.equipoLocal.escudoUrl)}" alt="" loading="lazy">` : ''}
                  <span class="match-team-name">${Helpers.escapeHtml(p.equipoLocal?.nombre || '')}</span>
                </div>
                <div>
                  <div class="flex items-center gap-sm" style="justify-content:center">
                    <input class="input" type="number" min="0" id="res-local-${p.id}" placeholder="0" style="width:60px;text-align:center;font-family:var(--font-mono);font-weight:700">
                    <span class="match-vs" style="font-weight:700">-</span>
                    <input class="input" type="number" min="0" id="res-visit-${p.id}" placeholder="0" style="width:60px;text-align:center;font-family:var(--font-mono);font-weight:700">
                  </div>
                </div>
                <div class="match-team match-team-right">
                  <span class="match-team-name">${Helpers.escapeHtml(p.equipoVisitante?.nombre || '')}</span>
                  ${p.equipoVisitante?.escudoUrl ? `<img class="team-escudo" src="${Helpers.escapeHtml(p.equipoVisitante.escudoUrl)}" alt="" loading="lazy">` : ''}
                </div>
              </div>
              <div style="text-align:right;padding-top:var(--space-sm);border-top:1px solid var(--color-border)">
                <button class="btn btn-success btn-sm" onclick="AdminPage._guardarResultado('${p.id}')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Guardar resultado
                </button>
              </div>
            </div>
          `).join('')
        }
      </div>
    `;
  },

  async _guardarResultado(id) {
    const golesLocal = parseInt(document.getElementById(`res-local-${id}`)?.value);
    const golesVisitante = parseInt(document.getElementById(`res-visit-${id}`)?.value);

    if (isNaN(golesLocal) || isNaN(golesVisitante)) {
      Toast.warning('Completá ambos goles');
      return;
    }

    try {
      await Api.patch(`/partidos/${id}/resultado`, { golesLocal, golesVisitante });
      Toast.success('Resultado guardado — puntos calculados');
      AdminPage._loadSection('resultados');
    } catch (err) {
      Toast.error(Helpers.getErrorMsg(err));
    }
  },

  _cargarResultado(id) {
    Swal.fire({
      title: 'Cargar resultado',
      html: `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group">
            <label class="form-label">Goles local</label>
            <input class="input" id="res-local-sw" type="number" min="0" value="0" style="margin-top:4px;text-align:center">
          </div>
          <div class="form-group">
            <label class="form-label">Goles visitante</label>
            <input class="input" id="res-visit-sw" type="number" min="0" value="0" style="margin-top:4px;text-align:center">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      background: '#1e293b',
      color: '#f8fafc',
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#64748b',
      preConfirm: async () => {
        const gl = parseInt(document.getElementById('res-local-sw')?.value);
        const gv = parseInt(document.getElementById('res-visit-sw')?.value);
        if (isNaN(gl) || isNaN(gv)) { Swal.showValidationMessage('Completá ambos goles'); return false; }
        return { golesLocal: gl, golesVisitante: gv };
      },
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          await Api.patch(`/partidos/${id}/resultado`, result.value);
          Toast.success('Resultado guardado — puntos calculados');
          AdminPage._loadSection('partidos');
        } catch (err) {
          Toast.error(Helpers.getErrorMsg(err));
        }
      }
    });
  },

  // ─── RANKING ─────────────────────────────────
  async _renderRanking(container) {
    const [globalRanking, pozo] = await Promise.all([
      Api.get('/ranking/global').catch(() => []),
      Api.get('/ranking/pozo').catch(() => 0),
    ]);

    const totalPuntos = globalRanking.reduce((s, r) => s + r.totalPuntos, 0);
    const totalPlenos = globalRanking.reduce((s, r) => s + r.totalPlenos, 0);

    container.innerHTML = `
      <div class="admin-section">
        <div class="admin-section-header">
          <h2>Gestión del Ranking</h2>
          <div class="admin-actions">
            <button class="btn btn-accent" onclick="AdminPage._recalcularRanking()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              Recalcular
            </button>
            <button class="btn btn-secondary" onclick="AdminPage._exportarRanking()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar
            </button>
          </div>
        </div>

        <div class="admin-dashboard-grid" style="margin-bottom:var(--space-lg)">
          <div class="admin-stat-card">
            <div class="admin-stat-value">${globalRanking.length}</div>
            <div class="admin-stat-label">Participantes</div>
          </div>
          <div class="admin-stat-card">
            <div class="admin-stat-value" style="color:var(--color-primary)">${totalPuntos}</div>
            <div class="admin-stat-label">Puntos totales</div>
          </div>
          <div class="admin-stat-card">
            <div class="admin-stat-value" style="color:var(--color-accent)">${totalPlenos}</div>
            <div class="admin-stat-label">Plenos totales</div>
          </div>
          <div class="admin-stat-card">
            <div class="admin-stat-value" style="color:var(--color-warning)">${pozo?.pozoTotal ?? pozo}</div>
            <div class="admin-stat-label">Pozo acumulado</div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Ranking Global Completo</h3>
            <span class="text-muted" style="font-size:0.85rem">${globalRanking.length} usuarios</span>
          </div>
          <div class="table-wrapper">
            <table class="ranking-table">
              <thead>
                <tr><th>#</th><th>Usuario</th><th>Puntos</th><th>Plenos</th></tr>
              </thead>
              <tbody>
                ${globalRanking.map((r, i) => `
                  <tr>
                    <td><span class="rank-pos">${r.posicion}</span></td>
                    <td><div class="flex items-center gap-sm"><div class="avatar avatar-sm">${Helpers.getInitials(r.username)}</div><span class="font-bold">${Helpers.escapeHtml(r.username)}</span></div></td>
                    <td class="font-mono font-bold" style="color:var(--color-primary)">${r.totalPuntos}</td>
                    <td class="font-mono text-muted">${r.totalPlenos}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  _recalcularRanking() {
    Toast.info('Funcionalidad de recálculo disponible próximamente');
  },

  _exportarRanking() {
    Toast.info('Funcionalidad de exportación disponible próximamente');
  },

  async _transicionarEstados() {
    try {
      const res = await Api.post('/partidos/transicionar');
      Toast.success(`${res.actualizados} partido(s) actualizado(s) a EN_JUEGO`);
      AdminPage._renderPartidos(document.querySelector('.admin-section'));
    } catch (err) {
      Toast.error(Helpers.getErrorMsg(err));
    }
  },
};
