const Router = {
  _routes: {},
  _prevHandler: null,
  _currentRoute: null,

  route(path, handler) {
    this._routes[path] = handler;
  },

  navigate(path, force = false) {
    if (force) this._currentRoute = null;
    window.location.hash = path;
  },

  getCurrentPath() {
    const hash = window.location.hash.slice(1) || '/';
    return hash.split('?')[0];
  },

  getQueryParams() {
    const hash = window.location.hash.slice(1);
    const qs = hash.split('?')[1];
    if (!qs) return {};
    return Object.fromEntries(new URLSearchParams(qs));
  },

  async handleRoute() {
    const path = this.getCurrentPath();
    if (path === this._currentRoute) return;

    if (this._prevHandler && typeof this._prevHandler.cleanup === 'function') {
      this._prevHandler.cleanup();
    }

    this._currentRoute = path;
    const app = document.getElementById('app');

    if (!Auth.isAuthenticated() && path !== '/login' && path !== '/') {
      this.navigate('/');
      return;
    }

    if (Auth.isAuthenticated() && path === '/') {
      this.navigate('/dashboard');
      return;
    }

    if (Auth.isAuthenticated() && path === '/login') {
      this.navigate('/dashboard');
      return;
    }

    const handler = this._routes[path];
    if (!handler) {
      this.navigate(Auth.isAuthenticated() ? '/dashboard' : '/');
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    this._prevHandler = handler;
    await handler(app);
  },

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  },
};

const App = {
  init() {
    Router.init();
  },
};

Router.route('/', (app) => LandingPage.render(app));
Router.route('/login', (app) => LoginPage.render(app));
Router.route('/dashboard', (app) => DashboardPage.render(app));
Router.route('/partidos', (app) => PartidosPage.render(app));
Router.route('/mis-pronosticos', (app) => MisPronosticosPage.render(app));
Router.route('/historial', (app) => HistorialPage.render(app));
Router.route('/ranking', (app) => RankingPage.render(app));
Router.route('/estadisticas', (app) => EstadisticasPage.render(app));
Router.route('/perfil', (app) => PerfilPage.render(app));
Router.route('/configuracion', (app) => ConfiguracionPage.render(app));
Router.route('/grupos', (app) => GruposPage.render(app));
Router.route('/admin', (app) => AdminPage.render(app));
