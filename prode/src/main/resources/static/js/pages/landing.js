const LandingPage = {
  _partidos: [],

  async render(main) {
    main.className = 'layout-main landing-active';

    try {
      this._partidos = await Api.get('/partidos/proximos?limite=6');
    } catch {
      this._partidos = [];
    }

    const isAuth = Auth.isAuthenticated();
    const user = Auth.getUser();

    main.innerHTML = `
      <div class="landing">
        <header class="landing-header">
          <div class="landing-header-inner">
            <div class="landing-logo">Prode</div>
            <nav class="landing-nav">
              <a href="#/partidos" class="landing-nav-link">Partidos</a>
              <a href="#/ranking" class="landing-nav-link">Ranking</a>
              <a href="#/grupos" class="landing-nav-link">Grupos</a>
            </nav>
            <div class="landing-actions">
              ${isAuth ? `
                <div class="landing-user">
                  <div class="avatar avatar-sm">${Helpers.getInitials(user?.username)}</div>
                  <span>${Helpers.escapeHtml(user?.username || '')}</span>
                </div>
                <a href="#/dashboard" class="btn btn-primary btn-sm">Ir al inicio</a>
              ` : `
                <a href="#/login" class="btn btn-ghost btn-sm">Iniciar sesión</a>
                <a href="#/login?tab=register" class="btn btn-primary btn-sm">Registrarse</a>
              `}
            </div>
            <button class="landing-menu-btn" id="landing-menu-btn" aria-label="Menú">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </header>

        <section class="landing-hero">
          <div class="landing-hero-bg"></div>
          <div class="landing-hero-content">
            <h1 class="landing-hero-title">Pronosticá, competí,<br>ganá el <span class="gradient-text">Prode</span></h1>
            <p class="landing-hero-subtitle">Creá pronósticos sobre los partidos de fútbol, competí con tus amigos en grupos privados y escalá posiciones en el ranking global.</p>
            <div class="landing-hero-cta">
              ${isAuth
                ? '<a href="#/dashboard" class="btn btn-primary btn-lg">Ir al dashboard</a>'
                : '<a href="#/login" class="btn btn-primary btn-lg">Comenzar a apostar</a>'
              }
              <a href="#/partidos" class="btn btn-outline btn-lg">Ver partidos</a>
            </div>
          </div>
        </section>

        <section class="landing-section" id="landing-partidos">
          <div class="landing-section-header">
            <h2>Próximos partidos</h2>
            <a href="#/partidos" class="btn btn-ghost btn-sm">Ver todos</a>
          </div>
          ${this._partidos.length === 0
            ? '<div class="empty-state"><p>No hay partidos próximos</p></div>'
            : `<div class="landing-partidos-grid">${this._partidos.map(p => this._renderPartidoCard(p)).join('')}</div>`
          }
        </section>

        <section class="landing-section landing-section-alt">
          <div class="landing-section-header">
            <h2>Cómo funciona</h2>
          </div>
          <div class="landing-steps">
            <div class="landing-step">
              <div class="landing-step-number">1</div>
              <h3>Registrate</h3>
              <p>Creá una cuenta gratuita en segundos y accedé a todos los partidos disponibles.</p>
            </div>
            <div class="landing-step">
              <div class="landing-step-number">2</div>
              <h3>Pronosticá</h3>
              <p>Elegí el resultado de cada partido antes de que comience. Acumulá puntos por cada acierto.</p>
            </div>
            <div class="landing-step">
              <div class="landing-step-number">3</div>
              <h3>Competí</h3>
              <p>Unite a grupos con tus amigos, seguí el ranking en vivo y demostrá quién sabe más de fútbol.</p>
            </div>
          </div>
        </section>

        <section class="landing-cta-section">
          <div class="landing-cta-card">
            <h2>¿Listo para empezar?</h2>
            <p>Registrate gratis y comenzá a pronosticar los partidos. Competí con amigos y demostrá tu conocimiento futbolero.</p>
            ${isAuth
              ? '<a href="#/dashboard" class="btn btn-primary btn-lg">Ir al dashboard</a>'
              : '<a href="#/login" class="btn btn-primary btn-lg">Crear cuenta gratis</a>'
            }
          </div>
        </section>

        <footer class="landing-footer">
          <div class="landing-footer-inner">
            <div class="landing-logo">Prode</div>
            <p class="text-muted">TPI Prode — UTN FRVM — Programación 4</p>
          </div>
        </footer>
      </div>

      <div class="landing-mobile-nav" id="landing-mobile-nav">
        <div class="landing-mobile-nav-header">
          <div class="landing-logo">Prode</div>
          <button class="landing-menu-btn" id="landing-menu-close" aria-label="Cerrar">&times;</button>
        </div>
        <nav class="landing-mobile-nav-links">
          <a href="#/partidos" class="landing-nav-link">Partidos</a>
          <a href="#/ranking" class="landing-nav-link">Ranking</a>
          <a href="#/grupos" class="landing-nav-link">Grupos</a>
          ${isAuth
            ? '<a href="#/dashboard" class="landing-nav-link">Dashboard</a>'
            : '<a href="#/login" class="landing-nav-link">Iniciar sesión</a>'
          }
          ${!isAuth ? '<a href="#/login?tab=register" class="landing-nav-link">Registrarse</a>' : ''}
        </nav>
      </div>
    `;

    this._bindEvents();
  },

  _renderPartidoCard(p) {
    const local = p.equipoLocal;
    const visitante = p.equipoVisitante;
    return `
      <div class="landing-partido-card">
        <div class="landing-partido-teams">
          <div class="landing-partido-team">
            <img class="landing-partido-escudo" src="${local.escudoUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%232a3a55"/><text x="50" y="65" text-anchor="middle" font-size="40" fill="%23899bb5">⚽</text></svg>'}" alt="${Helpers.escapeHtml(local.nombre)}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2245%22 fill=%22%232a3a55%22/><text x=%2250%22 y=%2265%22 text-anchor=%22middle%22 font-size=%2240%22 fill=%22%23899bb5%22>⚽</text></svg>'">
            <span class="landing-partido-team-nombre">${Helpers.escapeHtml(local.nombre)}</span>
          </div>
          <span class="landing-partido-vs">vs</span>
          <div class="landing-partido-team">
            <img class="landing-partido-escudo" src="${visitante.escudoUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%232a3a55"/><text x="50" y="65" text-anchor="middle" font-size="40" fill="%23899bb5">⚽</text></svg>'}" alt="${Helpers.escapeHtml(visitante.nombre)}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2245%22 fill=%22%232a3a55%22/><text x=%2250%22 y=%2265%22 text-anchor=%22middle%22 font-size=%2240%22 fill=%22%23899bb5%22>⚽</text></svg>'">
            <span class="landing-partido-team-nombre">${Helpers.escapeHtml(visitante.nombre)}</span>
          </div>
        </div>
        <div class="landing-partido-info">
          <span class="badge badge-info">${Helpers.estadoLabel(p.estado)}</span>
          <span class="text-muted">${Helpers.formatDateShort(p.inicioUtc)}</span>
        </div>
      </div>
    `;
  },

  _bindEvents() {
    const menuBtn = document.getElementById('landing-menu-btn');
    const menuClose = document.getElementById('landing-menu-close');
    const mobileNav = document.getElementById('landing-mobile-nav');

    if (menuBtn) {
      menuBtn.addEventListener('click', () => {
        if (mobileNav) mobileNav.classList.add('open');
      });
    }

    if (menuClose) {
      menuClose.addEventListener('click', () => {
        if (mobileNav) mobileNav.classList.remove('open');
      });
    }

    if (mobileNav) {
      mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => mobileNav.classList.remove('open'));
      });
    }
  },
};

LandingPage.cleanup = function () {
  const main = document.getElementById('main-content');
  if (main) main.classList.remove('landing-active');
};
