const Router = {
  _routes: {},
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
    if (this._currentRoute) {
      LandingPage.cleanup?.();
    }
    this._currentRoute = path;

    const main = document.getElementById('main-content');

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

    main.innerHTML = '<div class="loading-container"><div class="spinner spinner-lg"></div></div>';

    try {
      await handler(main);
      main.style.animation = 'none';
      requestAnimationFrame(() => {
        main.style.animation = 'fadeInUp 0.35s ease';
      });
      Navbar.render();
    } catch (err) {
      main.innerHTML = `
        <div class="page-section">
          <div class="alert alert-error">${Helpers.escapeHtml(err.message)}</div>
          <button class="btn btn-secondary" onclick="Router.handleRoute()">Reintentar</button>
        </div>
      `;
    }
  },

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  },
};

Router.route('/', (main) => LandingPage.render(main));
Router.route('/login', (main) => LoginPage.render(main));
Router.route('/dashboard', (main) => DashboardPage.render(main));
Router.route('/partidos', (main) => PartidosPage.render(main));
Router.route('/mis-pronosticos', (main) => MisPronosticosPage.render(main));
Router.route('/ranking', (main) => RankingPage.render(main));
Router.route('/grupos', (main) => GruposPage.render(main));
Router.route('/admin', (main) => AdminPage.render(main));

const App = {
  init() {
    Navbar.render();
    Router.init();
  },
};
