const PerfilPage = {
  _emailOriginal: '',

  async render(app) {
    Navbar.render();
    const content = document.getElementById('page-content');
    content.innerHTML = '<div class="loading-container"><div class="spinner spinner-lg"></div></div>';

    try {
      const results = await Promise.allSettled([
        Api.get('/pronosticos/mis-pronosticos'),
        Api.get('/ranking/global'),
        Api.get('/auth/me'),
      ]);

      const pronosticos = results[0].status === 'fulfilled' ? results[0].value : [];
      const globalRanking = results[1].status === 'fulfilled' ? results[1].value : [];
      const perfil = results[2].status === 'fulfilled' ? results[2].value : {};
      this._emailOriginal = perfil?.email || '';

      const user = Auth.getUser();

      const totalPreds = pronosticos.length;
      const aciertos = pronosticos.filter(p => p.puntos > 0).length;
      const totalPts = pronosticos.reduce((s, p) => s + (p.puntos || 0), 0);
      const pct = totalPreds > 0 ? Math.round((aciertos / totalPreds) * 100) : 0;

      content.innerHTML = `
        <div class="page-header">
          <div>
            <h1>Mi Perfil</h1>
            <p>Información de tu cuenta y estadísticas</p>
          </div>
        </div>

        <div class="perfil-header">
          <div class="perfil-avatar">${Helpers.getInitials(user?.username)}</div>
          <div class="perfil-info">
            <h2>${Helpers.escapeHtml(user?.username || '')}</h2>
            <p>${user?.rol === 'ADMIN' || user?.rol === 'ROLE_ADMIN' ? '👑 Administrador' : '👤 Usuario'}</p>
          </div>
        </div>

        <div class="perfil-stats-grid">
          <div class="card">
            <div class="card-body" style="text-align:center">
              <div class="stat-value" style="font-size:2rem">${totalPreds}</div>
              <div class="stat-label">Pronósticos</div>
            </div>
          </div>
          <div class="card">
            <div class="card-body" style="text-align:center">
              <div class="stat-value" style="font-size:2rem;color:var(--color-primary)">${aciertos}</div>
              <div class="stat-label">Aciertos</div>
            </div>
          </div>
          <div class="card">
            <div class="card-body" style="text-align:center">
              <div class="stat-value" style="font-size:2rem;color:var(--color-accent)">${pct}%</div>
              <div class="stat-label">Efectividad</div>
            </div>
          </div>
          <div class="card">
            <div class="card-body" style="text-align:center">
              <div class="stat-value" style="font-size:2rem;color:var(--color-warning)">${totalPts}</div>
              <div class="stat-label">Puntos</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Configuración de cuenta</h3>
          </div>
          <div class="card-body">
            <div class="flex flex-col gap-md">
              <div class="form-group">
                <label class="form-label">Nombre de usuario</label>
                <input class="input" value="${Helpers.escapeHtml(user?.username || '')}" disabled>
                <span class="form-hint">El nombre de usuario no se puede cambiar</span>
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input class="input" id="perfil-email" type="email" value="${Helpers.escapeHtml(perfil?.email || '')}">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Contraseña actual</label>
                  <input class="input" id="perfil-current-password" type="password" placeholder="Requerido para cambios">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Nueva contraseña</label>
                  <input class="input" id="perfil-password" type="password" placeholder="Dejar vacío para mantener">
                </div>
                <div class="form-group">
                  <label class="form-label">Confirmar contraseña</label>
                  <input class="input" id="perfil-password-confirm" type="password" placeholder="Repetir contraseña">
                </div>
              </div>
              <button class="btn btn-primary" onclick="PerfilPage._guardarCambios()">Guardar cambios</button>
              <button class="btn btn-danger" onclick="PerfilPage._confirmarCerrarSesion()">Cerrar sesión</button>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      content.innerHTML = `<div class="alert alert-error">${Helpers.escapeHtml(Helpers.getErrorMsg(err))}</div>`;
    }
  },

  async _guardarCambios() {
    const emailEl = document.getElementById('perfil-email');
    const email = emailEl?.value;
    const currentPassword = document.getElementById('perfil-current-password')?.value;
    const password = document.getElementById('perfil-password')?.value;
    const confirm = document.getElementById('perfil-password-confirm')?.value;

    if (!currentPassword) {
      Toast.error('La contraseña actual es obligatoria para guardar cambios');
      return;
    }

    if (password && password !== confirm) {
      Toast.error('Las contraseñas no coinciden');
      return;
    }

    if (password && password.length < 6) {
      Toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const emailChanged = email && email !== this._emailOriginal;

      if (emailChanged) {
        await Api.put('/auth/me', { email, currentPassword });
      }

      if (password) {
        await Api.put('/auth/password', {
          currentPassword,
          newPassword: password,
        });
      }

      Toast.success('Cambios guardados correctamente');
      this._emailOriginal = email || this._emailOriginal;
      if (emailEl) emailEl.value = this._emailOriginal;
      document.getElementById('perfil-current-password').value = '';
      document.getElementById('perfil-password').value = '';
      document.getElementById('perfil-password-confirm').value = '';
    } catch (err) {
      Toast.error(Helpers.getErrorMsg(err));
    }
  },

  _confirmarCerrarSesion() {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Vas a salir de tu cuenta.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Salir',
      cancelButtonText: 'Cancelar',
      background: '#1e293b',
      color: '#f8fafc',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
    }).then(result => {
      if (result.isConfirmed) {
        Auth.logout();
      }
    });
  },
};
