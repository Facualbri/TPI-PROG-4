const AdminPage = {
  async render(main) {
    if (!Auth.isAdmin()) {
      Router.navigate('/dashboard');
      return;
    }

    main.innerHTML = `
      <div class="page-header">
        <div>
          <h1>Panel de Administración</h1>
          <p>Gestión de equipos, fechas y partidos</p>
        </div>
      </div>

      <div class="tabs">
        <button class="tab active" data-section="equipos">Equipos</button>
        <button class="tab" data-section="fechas">Fechas</button>
        <button class="tab" data-section="partidos">Partidos</button>
      </div>

      <div id="admin-content">
        <div class="loading-container"><div class="spinner spinner-lg"></div></div>
      </div>
    `;

    main.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', async () => {
        main.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        await AdminPage._loadSection(tab.dataset.section);
      });
    });

    await AdminPage._loadSection('equipos');
  },

  async _loadSection(section) {
    const container = document.getElementById('admin-content');
    container.innerHTML = '<div class="loading-container"><div class="spinner spinner-lg"></div></div>';

    try {
      if (section === 'equipos') {
        await AdminPage._renderEquipos(container);
      } else if (section === 'fechas') {
        await AdminPage._renderFechas(container);
      } else if (section === 'partidos') {
        await AdminPage._renderPartidos(container);
      }
    } catch (err) {
      container.innerHTML = `<div class="alert alert-error">${Helpers.escapeHtml(err.message)}</div>`;
    }
  },

  // ---- EQUIPOS ----
  async _renderEquipos(container) {
    const equipos = await Api.get('/equipos');

    container.innerHTML = `
      <div class="admin-section">
        <div class="admin-section-header">
          <h2>Equipos (${equipos.length})</h2>
          <button class="btn btn-primary" onclick="AdminPage._showCrearEquipo()">+ Nuevo equipo</button>
        </div>
        <div class="card">
          <table class="ranking-table">
            <thead>
              <tr>
                <th></th>
                <th>Nombre</th>
                <th>País</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${equipos.map(e => `
                <tr>
                  <td>
                    ${e.escudoUrl
                      ? `<img class="team-escudo" src="${Helpers.escapeHtml(e.escudoUrl)}" alt="${Helpers.escapeHtml(e.nombre)}" loading="lazy" style="width:28px;height:28px">`
                      : `<div class="avatar avatar-sm">${Helpers.getInitials(e.nombre)}</div>`
                    }
                  </td>
                  <td class="font-bold">${Helpers.escapeHtml(e.nombre)}</td>
                  <td class="text-muted">${Helpers.escapeHtml(e.pais || '-')}</td>
                  <td>
                    <button class="btn btn-sm btn-danger" onclick="AdminPage._eliminarEquipo('${e.id}')">Eliminar</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  _showCrearEquipo() {
    Modal.show({
      title: 'Nuevo equipo',
      body: `
        <form id="crear-equipo-form" class="flex flex-col gap-md">
          <div class="form-group">
            <label class="form-label">Nombre</label>
            <input class="input" id="eq-nombre" required placeholder="Ej: Argentina">
          </div>
          <div class="form-group">
            <label class="form-label">País</label>
            <input class="input" id="eq-pais" placeholder="Ej: Argentina">
          </div>
          <div class="form-group">
            <label class="form-label">URL del escudo</label>
            <input class="input" id="eq-escudo" type="url" placeholder="https://...">
          </div>
        </form>
      `,
      confirmText: 'Crear',
      onConfirm: async () => {
        const nombre = document.getElementById('eq-nombre').value;
        const pais = document.getElementById('eq-pais').value;
        const escudoUrl = document.getElementById('eq-escudo').value;
        if (!nombre) { Toast.warning('El nombre es obligatorio'); return; }
        await Api.post('/equipos', { nombre, pais: pais || undefined, escudoUrl: escudoUrl || undefined });
        Toast.success('Equipo creado');
        AdminPage._loadSection('equipos');
      },
    });
  },

  async _eliminarEquipo(id) {
    Modal.show({
      title: 'Eliminar equipo',
      body: '<p>¿Estás seguro de eliminar este equipo?</p>',
      confirmText: 'Eliminar',
      onConfirm: async () => {
        await Api.del(`/equipos/${id}`);
        Toast.success('Equipo eliminado');
        AdminPage._loadSection('equipos');
      },
    });
  },

  // ---- FECHAS ----
  async _renderFechas(container) {
    const fechas = await Api.get('/fechas');

    container.innerHTML = `
      <div class="admin-section">
        <div class="admin-section-header">
          <h2>Fechas (${fechas.length})</h2>
          <button class="btn btn-primary" onclick="AdminPage._showCrearFecha()">+ Nueva fecha</button>
        </div>
        <div class="card">
          <table class="ranking-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${fechas.map(f => `
                <tr>
                  <td class="font-bold">${Helpers.escapeHtml(f.nombre)}</td>
                  <td><span class="badge ${Helpers.estadoClass(f.estado)}">${Helpers.estadoLabel(f.estado)}</span></td>
                  <td>
                    <button class="btn btn-sm btn-danger" onclick="AdminPage._eliminarFecha('${f.id}')">Eliminar</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  _showCrearFecha() {
    Modal.show({
      title: 'Nueva fecha',
      body: `
        <form id="crear-fecha-form" class="flex flex-col gap-md">
          <div class="form-group">
            <label class="form-label">Nombre</label>
            <input class="input" id="fecha-nombre" required placeholder="Ej: Fecha 1">
          </div>
        </form>
      `,
      confirmText: 'Crear',
      onConfirm: async () => {
        const nombre = document.getElementById('fecha-nombre').value;
        if (!nombre) { Toast.warning('El nombre es obligatorio'); return; }
        await Api.post('/fechas', { nombre });
        Toast.success('Fecha creada');
        AdminPage._loadSection('fechas');
      },
    });
  },

  async _eliminarFecha(id) {
    Modal.show({
      title: 'Eliminar fecha',
      body: '<p>¿Estás seguro de eliminar esta fecha?</p>',
      confirmText: 'Eliminar',
      onConfirm: async () => {
        await Api.del(`/fechas/${id}`);
        Toast.success('Fecha eliminada');
        AdminPage._loadSection('fechas');
      },
    });
  },

  // ---- PARTIDOS ----
  async _renderPartidos(container) {
    const [fechas, equipos] = await Promise.all([
      Api.get('/fechas'),
      Api.get('/equipos'),
    ]);

    State.setFechas(fechas);
    State.setEquipos(equipos);

    let partidos = [];
    if (fechas.length > 0) {
      partidos = await Api.get(`/partidos?fechaId=${fechas[0].id}`);
    }

    container.innerHTML = `
      <div class="admin-section">
        <div class="admin-section-header">
          <h2>Partidos</h2>
          <button class="btn btn-primary" onclick="AdminPage._showCrearPartido()">+ Nuevo partido</button>
        </div>

        <div class="form-group mb-md">
          <label class="form-label">Filtrar por fecha</label>
          <select id="admin-fecha-select" class="select">
            ${fechas.map(f => `<option value="${f.id}">${Helpers.escapeHtml(f.nombre)}</option>`).join('')}
          </select>
        </div>

        <div id="admin-partidos-list">
          ${partidos.map((p, i) => AdminPage._renderPartidoRow(p, i)).join('')}
        </div>
      </div>
    `;

    document.getElementById('admin-fecha-select').addEventListener('change', async (e) => {
      const lista = document.getElementById('admin-partidos-list');
      lista.innerHTML = '<div class="loading-container"><div class="spinner"></div></div>';
      const nuevos = await Api.get(`/partidos?fechaId=${e.target.value}`);
      lista.innerHTML = nuevos.map((p, i) => AdminPage._renderPartidoRow(p, i)).join('');
    });
  },

  _renderPartidoRow(p, index) {
    const delay = (index || 0) * 50;
    return `
      <div class="match-card mb-md" style="animation-delay:${delay}ms">
        <div class="match-card-header">
          <span class="badge ${Helpers.estadoClass(p.estado)}">${Helpers.estadoLabel(p.estado)}</span>
          <div class="flex gap-sm">
            ${p.estado === 'POR_JUGARSE' ? `
              <button class="btn btn-sm btn-warning" onclick="AdminPage._iniciarPartido('${p.id}')">Iniciar</button>
            ` : ''}
            ${p.estado === 'EN_JUEGO' ? `
              <button class="btn btn-sm btn-success" onclick="AdminPage._cargarResultado('${p.id}')">Resultado</button>
            ` : ''}
            <button class="btn btn-sm btn-danger" onclick="AdminPage._eliminarPartido('${p.id}')">Eliminar</button>
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
            ${p.estado === 'FINALIZADO'
              ? `<div class="match-score">${p.golesLocal} - ${p.golesVisitante}</div>`
              : '<div class="match-vs">vs</div>'
            }
            <div class="text-muted text-center" style="font-size:0.75rem">${Helpers.formatDateShort(p.inicioUtc)}</div>
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
    `;
  },

  _showCrearPartido() {
    if (State.data.fechas.length === 0 || State.data.equipos.length === 0) {
      Toast.warning('Necesitás fechas y equipos para crear partidos');
      return;
    }

    Modal.show({
      title: 'Nuevo partido',
      body: `
        <form id="crear-partido-form" class="flex flex-col gap-md">
          <div class="form-group">
            <label class="form-label">Fecha</label>
            <select class="select" id="partido-fecha">
              ${State.data.fechas.map(f => `<option value="${f.id}">${Helpers.escapeHtml(f.nombre)}</option>`).join('')}
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Equipo local</label>
              <select class="select" id="partido-local">
                ${State.data.equipos.map(e => `<option value="${e.id}">${Helpers.escapeHtml(e.nombre)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Equipo visitante</label>
              <select class="select" id="partido-visitante">
                ${State.data.equipos.map(e => `<option value="${e.id}">${Helpers.escapeHtml(e.nombre)}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Inicio (UTC)</label>
            <input class="input" id="partido-inicio" type="datetime-local" required>
          </div>
        </form>
      `,
      confirmText: 'Crear',
      onConfirm: async () => {
        const fechaId = document.getElementById('partido-fecha').value;
        const equipoLocalId = document.getElementById('partido-local').value;
        const equipoVisitanteId = document.getElementById('partido-visitante').value;
        const inicioLocal = document.getElementById('partido-inicio').value;

        if (!fechaId || !equipoLocalId || !equipoVisitanteId || !inicioLocal) {
          Toast.warning('Completá todos los campos');
          return;
        }

        const inicioUtc = new Date(inicioLocal).toISOString();

        await Api.post('/partidos', { fechaId, equipoLocalId, equipoVisitanteId, inicioUtc });
        Toast.success('Partido creado');
        AdminPage._loadSection('partidos');
      },
    });
  },

  async _iniciarPartido(id) {
    await Api.patch(`/partidos/${id}/en-juego`);
    Toast.success('Partido iniciado');
    AdminPage._loadSection('partidos');
  },

  _cargarResultado(id) {
    Modal.show({
      title: 'Cargar resultado',
      body: `
        <form id="resultado-form" class="flex flex-col gap-md">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Goles local</label>
              <input class="input" id="res-local" type="number" min="0" required>
            </div>
            <div class="form-group">
              <label class="form-label">Goles visitante</label>
              <input class="input" id="res-visitante" type="number" min="0" required>
            </div>
          </div>
        </form>
      `,
      confirmText: 'Guardar resultado',
      onConfirm: async () => {
        const golesLocal = parseInt(document.getElementById('res-local').value);
        const golesVisitante = parseInt(document.getElementById('res-visitante').value);
        if (isNaN(golesLocal) || isNaN(golesVisitante)) {
          Toast.warning('Completá ambos goles');
          return;
        }
        await Api.patch(`/partidos/${id}/resultado`, { golesLocal, golesVisitante });
        Toast.success('Resultado cargado');
        AdminPage._loadSection('partidos');
      },
    });
  },

  async _eliminarPartido(id) {
    Modal.show({
      title: 'Eliminar partido',
      body: '<p>¿Estás seguro de eliminar este partido?</p>',
      confirmText: 'Eliminar',
      onConfirm: async () => {
        await Api.del(`/partidos/${id}`);
        Toast.success('Partido eliminado');
        AdminPage._loadSection('partidos');
      },
    });
  },
};
