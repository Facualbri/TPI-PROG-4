const GruposPage = {
  async render(app) {
    Navbar.render();
    const content = document.getElementById('page-content');
    content.innerHTML = '<div class="loading-container"><div class="spinner spinner-lg"></div></div>';

    try {
      const misGrupos = await Api.get('/grupos/mis-grupos');

      content.innerHTML = `
        <div class="page-header">
          <div>
            <h1>Grupos</h1>
            <p>Creá o unite a grupos privados para competir con amigos</p>
          </div>
        </div>

        <div class="grid grid-2 mb-lg">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Crear grupo</h3>
            </div>
            <div class="card-body">
              <form id="crear-grupo-form" class="flex flex-col gap-md">
                <div class="form-group">
                  <label class="form-label">Nombre del grupo</label>
                  <input class="input" id="grupo-nombre" type="text" placeholder="Ej: Amigos del fútbol" required maxlength="80">
                </div>
                <button class="btn btn-primary" type="submit">Crear grupo</button>
              </form>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Unirse a un grupo</h3>
            </div>
            <div class="card-body">
              <form id="unirse-grupo-form" class="flex flex-col gap-md">
                <div class="form-group">
                  <label class="form-label">Código de invitación</label>
                  <input class="input" id="codigo-invitacion" type="text" placeholder="Ej: ABC123" required>
                  <span class="form-hint">Pedí el código al creador del grupo</span>
                </div>
                <button class="btn btn-accent" type="submit">Unirse</button>
              </form>
            </div>
          </div>
        </div>

        <div class="page-section">
          <h2 class="page-section-title">Mis grupos (${misGrupos.length})</h2>
          ${misGrupos.length === 0
            ? '<div class="empty-state"><div class="empty-state-icon">👥</div><div class="empty-state-title">Sin grupos</div><p>Todavía no pertenecés a ningún grupo. Creá uno o unite con un código.</p></div>'
            : `<div class="grid grid-2">${misGrupos.map(g => GruposPage._renderGrupo(g)).join('')}</div>`
          }
        </div>
      `;

      document.getElementById('crear-grupo-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('grupo-nombre').value.trim();
        if (!nombre) { Toast.warning('Ingresá un nombre'); return; }
        const btn = e.target.querySelector('button');
        btn.disabled = true;
        try {
          const grupo = await Api.post('/grupos', { nombre });
          Toast.success(`Grupo "${grupo.nombre}" creado`);
          document.getElementById('grupo-nombre').value = '';
          Router.navigate('/grupos', true);
        } catch (err) {
          Toast.error(Helpers.getErrorMsg(err));
        } finally {
          btn.disabled = false;
        }
      });

      document.getElementById('unirse-grupo-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const codigo = document.getElementById('codigo-invitacion').value.trim().toUpperCase();
        if (!codigo) { Toast.warning('Ingresá un código'); return; }
        const btn = e.target.querySelector('button');
        btn.disabled = true;
        try {
          await Api.post('/grupos/unirse', { codigoInvitacion: codigo });
          Toast.success('Te uniste al grupo');
          document.getElementById('codigo-invitacion').value = '';
          Router.navigate('/grupos', true);
        } catch (err) {
          Toast.error(Helpers.getErrorMsg(err));
        } finally {
          btn.disabled = false;
        }
      });
    } catch (err) {
      content.innerHTML = `<div class="alert alert-error">${Helpers.escapeHtml(Helpers.getErrorMsg(err))}</div>`;
    }
  },

  _renderGrupo(g) {
    return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">${Helpers.escapeHtml(g.nombre)}</h3>
          <span class="badge badge-info">${g.cantidadMiembros} miembros</span>
        </div>
        <div class="card-body">
          <p class="text-muted mb-md">Creado por ${Helpers.escapeHtml(g.creadorUsername)}</p>
          <div class="mb-md">
            <label class="form-label">Código de invitación</label>
            <div class="grupo-code">
              <span>${Helpers.escapeHtml(g.codigoInvitacion)}</span>
              <button class="btn btn-secondary btn-sm" onclick="GruposPage._copiarCodigo('${Helpers.escapeHtml(g.codigoInvitacion)}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copiar
              </button>
            </div>
          </div>
          <button class="btn btn-danger btn-sm" onclick="GruposPage._salirGrupo('${g.id}', '${Helpers.escapeHtml(g.nombre).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}')">Salir del grupo</button>
        </div>
      </div>
    `;
  },

  _copiarCodigo(codigo) {
    navigator.clipboard.writeText(codigo).then(() => {
      Toast.success('Código copiado al portapapeles');
    }).catch(() => {
      Toast.error('No se pudo copiar el código');
    });
  },

  _salirGrupo(grupoId, nombre) {
    Swal.fire({
      title: 'Salir del grupo',
      html: `<p>¿Estás seguro de que querés salir de <strong>${Helpers.escapeHtml(nombre)}</strong>?</p><p class="text-muted mt-sm" style="font-size:0.85rem">Si sos el único miembro, el grupo se eliminará.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Salir',
      cancelButtonText: 'Cancelar',
      background: '#1e293b',
      color: '#f8fafc',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await Api.post(`/grupos/${grupoId}/salir`);
          Toast.success('Saliste del grupo');
          Router.navigate('/grupos', true);
        } catch (err) {
          Toast.error(Helpers.getErrorMsg(err));
        }
      }
    });
  },
};
