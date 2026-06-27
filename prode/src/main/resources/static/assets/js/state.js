const State = {
  _listeners: [],

  subscribe(fn) {
    this._listeners.push(fn);
    return () => {
      this._listeners = this._listeners.filter(l => l !== fn);
    };
  },

  _notify() {
    this._listeners.forEach(fn => fn());
  },

  data: {
    user: null,
    fechas: [],
    equipos: [],
    theme: 'dark',
  },

  setUser(user) {
    this.data.user = user;
    this._notify();
  },

  setFechas(fechas) {
    this.data.fechas = fechas;
    this._notify();
  },

  setEquipos(equipos) {
    this.data.equipos = equipos;
    this._notify();
  },

  setTheme(theme) {
    this.data.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('prode_theme', theme);
    this._notify();
  },
};
