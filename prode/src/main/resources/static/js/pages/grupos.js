const GruposPage = {
  async render(main) {
    const misGrupos = await Api.get('/grupos/mis-grupos');

    main.innerHTML = `
      <div class="page-header">
        <div>
          <h1>Grupos</h1>
          <p>Creá o unite a grupos privados para competir</p>
        </div>
      </div>

      <div class="grid grid-2 mb-lg">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Crear grupo</h3>
          </div>
          <form id="crear-grupo-form" class="flex flex-col gap-md">
            <div class="form-group">
              <label class="form-label">Nombre del grupo</label>
              <input class="input" id="grupo-nombre" type="text" placeholder="Ej: Amigos del fútbol" required maxlength="80">
            </div>
            <button class="btn btn-primary" type="submit">Crear grupo</button>
          </form>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Unirse a un grupo</h3>
          </div>
          <form id="unirse-grupo-form" class="flex flex-col gap-md">
            <div class="form-group">
              <label class="form-label">Código de invitación</label>
              <input class="input" id="codigo-invitacion" type="text" placeholder="Ej: ABC123" required>
            </div>
            <button class="btn btn-secondary" type="submit">Unirse</button>
          </form>
        </div>
      </div>

      <div class="page-section">
        <h2 class="page-section-title">Mis grupos (${misGrupos.length})</h2>
        ${misGrupos.length === 0
          ? '<div class="empty-state"><p>Todavía no pertenecés a ningún grupo. Creá uno o unite con un código.</p></div>'
          : `<div class="grid grid-2">${misGrupos.map(g => GruposPage._renderGrupo(g)).join('')}</div>`
        }
      </div>
    `;

    document.getElementById('crear-grupo-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const nombre = document.getElementById('grupo-nombre').value;
      const btn = e.target.querySelector('button');
      btn.disabled = true;
      try {
        const grupo = await Api.post('/grupos', { nombre });
        Toast.success('Grupo creado');
        document.getElementById('grupo-nombre').value = '';
        Router.navigate('/grupos', true);
      } catch (err) {
        Toast.error(err.message);
      } finally {
        btn.disabled = false;
      }
    });

    document.getElementById('unirse-grupo-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const codigo = document.getElementById('codigo-invitacion').value;
      const btn = e.target.querySelector('button');
      btn.disabled = true;
      try {
        await Api.post('/grupos/unirse', { codigoInvitacion: codigo });
        Toast.success('Te uniste al grupo');
        document.getElementById('codigo-invitacion').value = '';
        Router.navigate('/grupos', true);
      } catch (err) {
        Toast.error(err.message);
      } finally {
        btn.disabled = false;
      }
    });
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
              <button class="btn btn-sm btn-secondary" onclick="GruposPage._copiarCodigo('${Helpers.escapeHtml(g.codigoInvitacion)}')">Copiar</button>
            </div>
          </div>
          <button class="btn btn-sm btn-danger" onclick="GruposPage._salirGrupo('${g.id}', '${Helpers.escapeHtml(g.nombre)}')">Salir del grupo</button>
        </div>
      </div>
    `;
  },

  _copiarCodigo(codigo) {
    navigator.clipboard.writeText(codigo).then(() => {
      Toast.success('Código copiado');
    }).catch(() => {
      Toast.error('No se pudo copiar');
    });
  },

  _salirGrupo(grupoId, nombre) {
    Modal.show({
      title: 'Salir del grupo',
      body: `<p>¿Estás seguro de que querés salir de <strong>${Helpers.escapeHtml(nombre)}</strong>?</p><p class="text-muted mt-sm" style="font-size:0.85rem">Si sos el único miembro, el grupo se eliminará.</p>`,
      confirmText: 'Salir',
      onConfirm: async () => {
        try {
          await Api.post(`/grupos/${grupoId}/salir`);
          Toast.success('Saliste del grupo');
          Router.navigate('/grupos', true);
        } catch (err) {
          Toast.error(err.message);
        }
      },
    });
  },
};
