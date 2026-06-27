const ConfiguracionPage = {
  async render(app) {
    Navbar.render();
    const content = document.getElementById('page-content');

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';

    content.innerHTML = `
      <div class="page-header">
        <div>
          <h1>Configuración</h1>
          <p>Personalizá tu experiencia en el Prode</p>
        </div>
      </div>

      <div class="config-section">
        <h3 class="config-section-title">Apariencia</h3>
        <div class="config-item">
          <div class="config-item-info">
            <h4>Tema oscuro</h4>
            <p>Cambiá entre tema oscuro y claro</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="theme-toggle" ${currentTheme === 'dark' ? 'checked' : ''} onchange="ConfiguracionPage._toggleTheme()">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div class="config-section">
        <h3 class="config-section-title">Notificaciones</h3>
        <div class="config-item">
          <div class="config-item-info">
            <h4>Resultados de partidos</h4>
            <p>Recibir notificaciones cuando finalicen los partidos</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" checked disabled>
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="config-item">
          <div class="config-item-info">
            <h4>Recordatorio de pronósticos</h4>
            <p>Recordar pronosticar antes de cada fecha</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" checked disabled>
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div class="config-section">
        <h3 class="config-section-title">Información</h3>
        <div class="config-item">
          <div class="config-item-info">
            <h4>Versión</h4>
            <p>1.0.0</p>
          </div>
        </div>
        <div class="config-item">
          <div class="config-item-info">
            <h4>TPI Prode</h4>
            <p>UTN FRVM — Programación 4</p>
          </div>
        </div>
      </div>

      <div class="config-section">
        <button class="btn btn-danger" onclick="ConfiguracionPage._confirmarReset()">
          Restablecer configuración
        </button>
      </div>
    `;
  },

  _toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = current === 'dark' ? 'light' : 'dark';
    State.setTheme(newTheme);
    Toast.success(newTheme === 'dark' ? 'Tema oscuro activado' : 'Tema claro activado');
  },

  _confirmarReset() {
    Swal.fire({
      title: '¿Restablecer configuración?',
      text: 'Se volverán a los valores predeterminados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Restablecer',
      cancelButtonText: 'Cancelar',
      background: '#1e293b',
      color: '#f8fafc',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
    }).then(result => {
      if (result.isConfirmed) {
        State.setTheme('dark');
        Toast.success('Configuración restablecida');
      }
    });
  },
};
