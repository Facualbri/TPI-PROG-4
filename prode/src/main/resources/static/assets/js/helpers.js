const Helpers = {
  formatDate(isoString) {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleDateString('es-AR', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  },

  formatDateShort(isoString) {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleDateString('es-AR', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  },

  formatTime(isoString) {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  },

  formatDateOnly(isoString) {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleDateString('es-AR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  },

  estadoClass(estado) {
    const map = {
      POR_JUGARSE: 'badge-info',
      PROGRAMADA: 'badge-info',
      EN_JUEGO: 'badge-warning',
      FINALIZADO: 'badge-success',
      FINALIZADA: 'badge-success',
      SUSPENDIDO: 'badge-danger',
    };
    return map[estado] || 'badge-default';
  },

  estadoLabel(estado) {
    const map = {
      POR_JUGARSE: 'Por jugarse',
      PROGRAMADA: 'Programada',
      EN_JUEGO: 'En juego',
      FINALIZADO: 'Finalizado',
      FINALIZADA: 'Finalizada',
      SUSPENDIDO: 'Suspendido',
    };
    return map[estado] || estado || '-';
  },

  getInitials(name) {
    if (!name) return '?';
    return name.slice(0, 2).toUpperCase();
  },

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  getQueryParam(name) {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    return params.get(name);
  },

  truncate(str, len = 30) {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) + '...' : str;
  },

  formatPuntos(puntos) {
    if (puntos == null) return '0';
    return puntos > 0 ? `+${puntos}` : String(puntos);
  },

  renderSkeleton(type = 'card', count = 1) {
    let html = '';
    for (let i = 0; i < count; i++) {
      if (type === 'card') {
        html += '<div class="skeleton skeleton-card mb-md"></div>';
      } else if (type === 'stat') {
        html += '<div class="stat-card"><div class="skeleton skeleton-stat"></div></div>';
      } else if (type === 'text') {
        html += '<div class="skeleton skeleton-text"></div>';
      } else if (type === 'match') {
        html += `
          <div class="match-card mb-md">
            <div class="match-card-header">
              <div class="skeleton" style="width:80px;height:20px"></div>
              <div class="skeleton" style="width:100px;height:20px"></div>
            </div>
            <div class="match-card-body">
              <div class="match-team"><div class="skeleton skeleton-avatar"></div><div class="skeleton" style="width:80px;height:16px"></div></div>
              <div class="skeleton" style="width:60px;height:24px"></div>
              <div class="match-team match-team-right"><div class="skeleton" style="width:80px;height:16px"></div><div class="skeleton skeleton-avatar"></div></div>
            </div>
          </div>`;
      }
    }
    return html;
  },

  getErrorMsg(err) {
    if (typeof err === 'string') return err;
    if (err && err.message) return err.message;
    return 'Error inesperado';
  },
};
