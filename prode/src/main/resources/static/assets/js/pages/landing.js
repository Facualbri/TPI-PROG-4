const LandingPage = {
  _equipos: [],
  _partidos: [],
  _ranking: [],
  _observer: null,
  _counterObservers: [],

  async render(app) {
    app.innerHTML = '';

    const results = await Promise.allSettled([
      Api.get('/equipos'),
      Api.get('/partidos/proximos?limite=6'),
      Api.get('/ranking/global?limite=5'),
    ]);

    this._equipos = results[0].status === 'fulfilled' ? results[0].value : [];
    this._partidos = results[1].status === 'fulfilled' ? results[1].value : [];
    this._ranking  = results[2].status === 'fulfilled' ? results[2].value : [];

    const isAuth = Auth.isAuthenticated();
    const user   = Auth.getUser();
    const ranked = this._ranking;

    const partidosPorFecha = this._partidos.reduce((acc, p) => {
      const key = p.fechaNombre || 'Próximos';
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    }, {});

    const countHtml = (val) => `data-count-to="${val}"`;

    app.innerHTML = `
      <div class="landing">

        <!-- ══ NAVBAR ══ -->
        <nav class="landing-navbar" id="landing-navbar">
          <div class="landing-navbar-inner">
            <div class="landing-logo">Prode</div>
            <div class="landing-nav-links">
              <a href="#/" data-scroll="landing-hero"     class="landing-nav-link">Inicio</a>
              <a href="#/" data-scroll="landing-equipos"  class="landing-nav-link">Equipos</a>
              <a href="#/" data-scroll="landing-partidos" class="landing-nav-link">Partidos</a>
              <a href="#/" data-scroll="landing-ranking"  class="landing-nav-link">Ranking</a>
            </div>
            <div class="landing-nav-actions">
              ${isAuth ? `
                <div class="flex items-center gap-sm">
                  <div class="avatar avatar-sm">${Helpers.getInitials(user?.username)}</div>
                  <span class="text-secondary" style="font-size:0.85rem">${Helpers.escapeHtml(user?.username || '')}</span>
                </div>
                <a href="#/dashboard" class="btn btn-primary btn-sm">Ir al inicio</a>
              ` : `
                <a href="#/login" class="btn btn-ghost btn-sm">Iniciar sesión</a>
                <a href="#/login?tab=register" class="btn btn-primary btn-sm">Registrarse</a>
              `}
            </div>
            <button class="landing-menu-btn" id="landing-menu-btn" aria-label="Menú">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </nav>

        <!-- ══ HERO ══ -->
        <section class="landing-hero" id="landing-hero" data-reveal>

          <!-- Fondo decorativo -->
          <div class="landing-hero-bg">
            <div class="landing-light-beam"></div>
            <div class="landing-light-beam"></div>
            <div class="landing-light-beam"></div>
            <div class="landing-light-beam"></div>
            <div class="landing-light-beam"></div>
            <div class="landing-hero-particle"></div>
            <div class="landing-hero-particle"></div>
            <div class="landing-hero-particle"></div>
            <div class="landing-hero-particle"></div>
            <div class="landing-hero-particle"></div>
            <div class="landing-hero-particle"></div>
            <div class="landing-hero-particle"></div>
            <div class="landing-hero-particle"></div>
            <div class="landing-hero-orb"></div>
          </div>

          <!-- Columna izquierda -->
          <div class="landing-hero-left">
            <div class="landing-hero-badge">🔥 EL PRODE MÁS COMPLETO</div>

            <h1 class="landing-hero-title">
              Demostrá cuánto<br>sabés de <span class="text-gradient">fútbol</span>
            </h1>

            <p class="landing-hero-subtitle">
              Predecí resultados, competí con tus amigos y convertite en el campeón del Prode.
            </p>

            <div class="landing-hero-actions">
              ${isAuth
                ? '<a href="#/dashboard" class="btn btn-primary btn-xl">Ir al dashboard →</a>'
                : '<a href="#/login" class="btn btn-primary btn-xl">Apostar ahora →</a>'
              }
              <a href="#/login?tab=register" class="btn-secondary-hero btn btn-xl">Crear cuenta</a>
            </div>
          </div>

          <!-- Columna derecha — Escena 3D -->
          <div class="landing-hero-right">
            <div class="landing-hero-scene">
              <div class="landing-hero-halo"></div>

              <!-- Pantalla flotante -->
              <div class="landing-hero-screen">
                <div class="landing-hero-screen-header">
                  <span class="landing-hero-screen-logo">Prode</span>
                  <span class="landing-hero-screen-badge">PRÓXIMOS</span>
                </div>

                ${this._partidos.length > 0 ? this._partidos.slice(0, 3).map(p => `
                <div class="landing-hero-screen-match">
                  <div class="landing-hero-screen-team">
                    <span class="landing-hero-screen-team-dot home">${Helpers.escapeHtml(p.equipoLocal?.nombre?.slice(0, 2).toUpperCase() || '--')}</span>
                    <span class="landing-hero-screen-team-name">${Helpers.escapeHtml(p.equipoLocal?.nombre || '')}</span>
                  </div>
                  <span class="landing-hero-screen-vs">VS</span>
                  <div class="landing-hero-screen-team landing-hero-screen-team-right">
                    <span class="landing-hero-screen-team-name">${Helpers.escapeHtml(p.equipoVisitante?.nombre || '')}</span>
                    <span class="landing-hero-screen-team-dot away">${Helpers.escapeHtml(p.equipoVisitante?.nombre?.slice(0, 2).toUpperCase() || '--')}</span>
                  </div>
                </div>
                `).join('') : Array.from({length: 3}, () => `
                <div class="landing-hero-screen-match">
                  <div class="landing-hero-screen-team">
                    <span class="landing-hero-screen-team-dot home">--</span>
                    <span class="landing-hero-screen-team-name">Cargando...</span>
                  </div>
                  <span class="landing-hero-screen-vs">VS</span>
                  <div class="landing-hero-screen-team landing-hero-screen-team-right">
                    <span class="landing-hero-screen-team-name">Cargando...</span>
                    <span class="landing-hero-screen-team-dot away">--</span>
                  </div>
                </div>
                `).join('')}

                <div class="landing-hero-screen-predict">
                  <button class="landing-hero-screen-predict-btn" onclick="location.hash='${isAuth ? '#/partidos' : '#/login'}'">Pronosticar</button>
                  <span class="landing-hero-screen-predict-label">${this._partidos.length} partido${this._partidos.length !== 1 ? 's' : ''} disponible${this._partidos.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div class="landing-hero-ball" aria-hidden="true">⚽</div>
              <div class="landing-hero-trophy" aria-hidden="true">🏆</div>

              <div class="landing-hero-sparkle"></div>
              <div class="landing-hero-sparkle"></div>
              <div class="landing-hero-sparkle"></div>
              <div class="landing-hero-sparkle"></div>
              <div class="landing-hero-sparkle"></div>
            </div>
          </div>
        </section>

        <!-- ══ EQUIPOS ══ -->
        <section class="landing-section" id="landing-equipos">
          <div class="landing-section-orb" aria-hidden="true"></div>
          <div class="landing-section-header">
            <span class="landing-section-eyebrow">Participantes</span>
            <h2>Equipos</h2>
            <p>Los equipos disponibles en el Prode</p>
          </div>
          <div class="landing-equipos-grid landing-reveal">
            ${this._equipos.length > 0 ? this._equipos.map((eq, i) => `
              <div class="landing-equipo-card">
                <img class="landing-equipo-escudo"
                  src="${Helpers.escapeHtml(eq.escudoUrl || '')}"
                  alt="${Helpers.escapeHtml(eq.nombre)}"
                  loading="lazy"
                  onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚽</text></svg>'">
                <div class="landing-equipo-nombre">${Helpers.escapeHtml(eq.nombre)}</div>
                ${eq.pais ? `<div class="landing-equipo-pais">${Helpers.escapeHtml(eq.pais)}</div>` : ''}
              </div>
            `).join('') : Array.from({length: 8}, () => `
              <div class="landing-equipo-card">
                <div class="skeleton skeleton-avatar" style="width:54px;height:54px;margin:0 auto 8px"></div>
                <div class="skeleton" style="width:65%;height:13px;margin:0 auto"></div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- ══ PARTIDOS ══ -->
        <section class="landing-section" id="landing-partidos">
          <div class="landing-section-orb" aria-hidden="true"></div>
          <div class="landing-section-header">
            <span class="landing-section-eyebrow">Próximas fechas</span>
            <h2>Próximos partidos</h2>
            <p>Los encuentros que se vienen — pronosticá antes de que comiencen</p>
          </div>
          <div class="landing-partidos-list">
            ${Object.keys(partidosPorFecha).length > 0
              ? Object.entries(partidosPorFecha).map(([fecha, partidos]) => `
                <div>
                  <div class="landing-partido-group-title">${Helpers.escapeHtml(fecha)}</div>
                  ${partidos.map((p) => {
                    const isPronosticable = !p.bloqueado && (p.estado === 'POR_JUGARSE' || p.estado === 'PROGRAMADA');
                    const escudoLocal    = p.equipoLocal?.escudoUrl    || '';
                    const escudoVisit    = p.equipoVisitante?.escudoUrl || '';
                    const fallback       = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚽</text></svg>";
                    return `
                      <div class="landing-partido-card landing-reveal" style="margin-bottom:var(--space-sm)">
                        <div class="landing-partido-card-body">
                          <div class="landing-partido-team">
                            <img class="landing-partido-team-escudo"
                              src="${Helpers.escapeHtml(escudoLocal)}"
                              alt="${Helpers.escapeHtml(p.equipoLocal?.nombre || '')}"
                              loading="lazy"
                              onerror="this.src='${fallback}'">
                            <span class="landing-partido-team-name">${Helpers.escapeHtml(p.equipoLocal?.nombre || '')}</span>
                          </div>
                          <div class="landing-partido-vs">VS</div>
                          <div class="landing-partido-team landing-partido-team-right">
                            <img class="landing-partido-team-escudo"
                              src="${Helpers.escapeHtml(escudoVisit)}"
                              alt="${Helpers.escapeHtml(p.equipoVisitante?.nombre || '')}"
                              loading="lazy"
                              onerror="this.src='${fallback}'">
                            <span class="landing-partido-team-name">${Helpers.escapeHtml(p.equipoVisitante?.nombre || '')}</span>
                          </div>
                        </div>
                        <div class="landing-partido-footer">
                          <div class="landing-partido-meta">
                            <span class="badge ${Helpers.estadoClass(p.estado)}">${Helpers.estadoLabel(p.estado)}</span>
                            <span>${Helpers.formatDateShort(p.inicioUtc)}</span>
                          </div>
                          ${isPronosticable ? `<a href="#/login" class="btn btn-primary btn-sm">Pronosticar</a>` : ''}
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              `).join('')
              : '<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-title">No hay partidos próximos</div><p>Volvé más tarde para ver los próximos encuentros.</p></div>'
            }
          </div>
        </section>

        <!-- ══ CÓMO FUNCIONA ══ -->
        <section class="landing-section" id="landing-pasos">
          <div class="landing-section-orb" aria-hidden="true"></div>
          <div class="landing-section-header">
            <span class="landing-section-eyebrow">Simple y rápido</span>
            <h2>¿Cómo funciona?</h2>
            <p>En solo 4 pasos empezás a pronosticar y competir</p>
          </div>
          <div class="landing-steps-grid">
            <div class="landing-step landing-reveal" style="transition-delay:0ms">
              <div class="landing-step-number">1</div>
              <h3>Registrate</h3>
              <p>Creá tu cuenta gratuita en segundos. Solo necesitás un usuario, email y contraseña.</p>
            </div>
            <div class="landing-step landing-reveal" style="transition-delay:100ms">
              <div class="landing-step-number">2</div>
              <h3>Realizá tus predicciones</h3>
              <p>Elegí el resultado de cada partido antes de que comience. Acumulá puntos por cada acierto.</p>
            </div>
            <div class="landing-step landing-reveal" style="transition-delay:200ms">
              <div class="landing-step-number">3</div>
              <h3>Esperá los resultados</h3>
              <p>Seguí los partidos en vivo y enterate al instante si acertaste tu pronóstico.</p>
            </div>
            <div class="landing-step landing-reveal" style="transition-delay:300ms">
              <div class="landing-step-number">4</div>
              <h3>Subí en el ranking</h3>
              <p>Competí en el ranking global y con tus amigos en grupos privados. ¡El mejor gana!</p>
            </div>
          </div>
        </section>

        <!-- ══ RANKING ══ -->
        <section class="landing-section" id="landing-ranking">
          <div class="landing-section-orb" aria-hidden="true"></div>
          <div class="landing-section-header">
            <span class="landing-section-eyebrow">Tabla de posiciones</span>
            <h2>Ranking global</h2>
            <p>Los mejores pronosticadores de la comunidad</p>
          </div>
          ${ranked.length > 0 ? `
            <div class="landing-ranking-list">
              ${ranked.map((r, i) => {
                const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : '';
                const medal     = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
                return `
                  <div class="landing-ranking-item ${rankClass} landing-reveal" style="transition-delay:${i * 60}ms">
                    <div class="landing-ranking-pos">${medal || `<span style="font-family:var(--font-mono);font-size:0.85rem;color:#64748b">#${r.posicion}</span>`}</div>
                    <div class="landing-ranking-user">
                      <div class="avatar avatar-sm">${Helpers.getInitials(r.username)}</div>
                      <span class="landing-ranking-username">${Helpers.escapeHtml(r.username)}</span>
                    </div>
                    <div class="landing-ranking-stats">
                      <span class="landing-ranking-plenos">${r.totalPlenos} ${r.totalPlenos === 1 ? 'pleno' : 'plenos'}</span>
                      <span class="landing-ranking-puntos" ${countHtml(r.totalPuntos)}>0 pts</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
            <div class="text-center mt-md">
              <a href="#/ranking" class="btn btn-secondary">Ver ranking completo →</a>
            </div>
          ` : '<div class="empty-state"><div class="empty-state-icon">🏆</div><div class="empty-state-title">Sin datos</div><p>Aún no hay puntuaciones registradas.</p></div>'}
        </section>

        <!-- ══ CTA ══ -->
        <section class="landing-cta">
          <div class="landing-section-orb" aria-hidden="true"></div>
          <div class="landing-cta-card">
            <h2>¿Listo para empezar?</h2>
            <p>Registrate gratis y comenzá a pronosticar los partidos. Competí con amigos y demostrá tu conocimiento futbolero.</p>
            ${isAuth
              ? '<a href="#/dashboard" class="btn btn-primary">Ir al dashboard →</a>'
              : '<a href="#/login?tab=register" class="btn btn-primary">Crear cuenta gratis →</a>'
            }
          </div>
        </section>

        <!-- ══ FOOTER ══ -->
        <footer class="landing-footer">
          <div class="landing-footer-grid">
            <div class="landing-footer-col landing-footer-brand">
              <div class="landing-logo">Prode</div>
              <p>Pronosticá, competí y ganá. El Prode más completo para los amantes del fútbol.</p>
              <div class="landing-footer-social">
                <a href="#" class="landing-footer-social-link" title="Twitter/X">𝕏</a>
                <a href="#" class="landing-footer-social-link" title="Instagram">IG</a>
                <a href="mailto:prode@utn.edu" class="landing-footer-social-link" title="Email">@</a>
              </div>
            </div>
            <div class="landing-footer-col">
              <h4>Navegación</h4>
              <a href="#/partidos">Partidos</a>
              <a href="#/ranking">Ranking</a>
              <a href="#/grupos">Grupos</a>
              <a href="#/estadisticas">Estadísticas</a>
            </div>
          </div>
          <div class="landing-footer-bottom">
            <p>TPI UTN FRVM &mdash; Programación 4 &copy; ${new Date().getFullYear()}</p>
          </div>
        </footer>

        <!-- ══ MENÚ MÓVIL ══ -->
        <div class="landing-mobile-nav" id="landing-mobile-nav">
          <div class="landing-mobile-nav-header">
            <div class="landing-logo">Prode</div>
            <button class="landing-menu-btn" id="landing-menu-close" aria-label="Cerrar">&times;</button>
          </div>
          <nav class="landing-mobile-nav-links">
            <a href="#/" data-scroll="landing-hero"     class="landing-nav-link">Inicio</a>
            <a href="#/" data-scroll="landing-equipos"  class="landing-nav-link">Equipos</a>
            <a href="#/" data-scroll="landing-partidos" class="landing-nav-link">Partidos</a>
            <a href="#/" data-scroll="landing-ranking"  class="landing-nav-link">Ranking</a>
            ${isAuth
              ? '<a href="#/dashboard" class="landing-nav-link">Dashboard</a>'
              : '<a href="#/login" class="landing-nav-link">Iniciar sesión</a>'
            }
            ${!isAuth ? '<a href="#/login?tab=register" class="landing-nav-link">Registrarse</a>' : ''}
          </nav>
        </div>

      </div><!-- /landing -->
    `;

    this._bindEvents();
  },

  /* ──────────────────────────────────────────────
     Contadores animados
  ────────────────────────────────────────────── */
  _animateCounters() {
    document.querySelectorAll('[data-count-to]').forEach(el => {
      const target = parseInt(el.getAttribute('data-count-to'), 10);
      if (isNaN(target)) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const duration = 900;
            const start    = performance.now();
            const step     = (now) => {
              const progress = Math.min((now - start) / duration, 1);
              const eased    = 1 - Math.pow(1 - progress, 3);
              el.textContent = `${Math.round(target * eased)} pts`;
              if (progress < 1) requestAnimationFrame(step);
              else el.textContent = `${target} pts`;
            };
            requestAnimationFrame(step);
            observer.unobserve(el);
            this._counterObservers = this._counterObservers.filter(o => o !== observer);
          }
        });
      }, { threshold: 0.5 });

      observer.observe(el);
      this._counterObservers.push(observer);
    });
  },

  /* ──────────────────────────────────────────────
     Scroll reveal
  ────────────────────────────────────────────── */
  _setupScrollReveal() {
    const els = document.querySelectorAll('[data-reveal], .landing-reveal, .landing-reveal-left, .landing-reveal-right, .landing-reveal-scale');
    if (!els.length) return;

    this._observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          this._observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => this._observer.observe(el));
  },

  /* ──────────────────────────────────────────────
     Navbar scroll
  ────────────────────────────────────────────── */
  _setupNavbarScroll() {
    const navbar = document.getElementById('landing-navbar');
    if (!navbar) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          navbar.classList.toggle('scrolled', window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    this._navbarScrollHandler = onScroll;
  },

  /* ──────────────────────────────────────────────
     Sección activa en navbar
  ────────────────────────────────────────────── */
  _setupActiveSection() {
    const sections = ['landing-hero', 'landing-equipos', 'landing-partidos', 'landing-ranking'];
    const links    = document.querySelectorAll('.landing-nav-link[data-scroll]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach(link => link.classList.toggle('active', link.getAttribute('data-scroll') === id));
        }
      });
    }, { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' });

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    this._sectionObserver = observer;
  },

  /* ──────────────────────────────────────────────
     Eventos
  ────────────────────────────────────────────── */
  _bindEvents() {
    const menuBtn   = document.getElementById('landing-menu-btn');
    const menuClose = document.getElementById('landing-menu-close');
    const mobileNav = document.getElementById('landing-mobile-nav');

    if (menuBtn)   menuBtn.addEventListener('click',   () => mobileNav?.classList.add('open'));
    if (menuClose) menuClose.addEventListener('click', () => mobileNav?.classList.remove('open'));
    if (mobileNav) {
      mobileNav.querySelectorAll('a').forEach(link =>
        link.addEventListener('click', () => mobileNav.classList.remove('open'))
      );
    }

    document.querySelectorAll('[data-scroll]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.getElementById(link.getAttribute('data-scroll'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    this._animateCounters();
    this._setupScrollReveal();
    this._setupNavbarScroll();
    this._setupActiveSection();
  },
};

LandingPage.cleanup = function () {
  if (this._observer)        this._observer.disconnect();
  if (this._sectionObserver) this._sectionObserver.disconnect();
  this._counterObservers.forEach(o => o.disconnect());
  this._counterObservers = [];
  if (this._navbarScrollHandler) {
    window.removeEventListener('scroll', this._navbarScrollHandler);
  }
};
