const Helpers = {
  formatDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString('es-AR', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  },

  formatDateShort(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString('es-AR', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  },

  formatTime(isoString) {
    const d = new Date(isoString);
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  },

  estadoClass(estado) {
    const map = {
      POR_JUGARSE: 'badge-info',
      EN_JUEGO: 'badge-warning',
      FINALIZADO: 'badge-success',
      FINALIZADA: 'badge-success',
      PROGRAMADA: 'badge-default',
    };
    return map[estado] || 'badge-default';
  },

  estadoLabel(estado) {
    const map = {
      POR_JUGARSE: 'Por jugarse',
      EN_JUEGO: 'En juego',
      FINALIZADO: 'Finalizado',
      FINALIZADA: 'Finalizada',
      PROGRAMADA: 'Programada',
    };
    return map[estado] || estado;
  },

  getInitials(name) {
    if (!name) return '?';
    return name.slice(0, 2).toUpperCase();
  },

  escapeHtml(str) {
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
};
