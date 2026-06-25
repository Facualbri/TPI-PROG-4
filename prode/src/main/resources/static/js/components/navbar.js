const Navbar = {
  render() {
    const user = Auth.getUser();
    const isAdmin = Auth.isAdmin();
    const nav = document.getElementById('navbar');
    if (!nav) return;

    const currentPath = Router.getCurrentPath();
    if (currentPath === '/') {
      nav.innerHTML = '';
      nav.classList.remove('sidebar');
      this._hideMobileHeader();
      return;
    }

    this._renderMobileHeader();

    if (!Auth.isAuthenticated()) {
      nav.innerHTML = '';
      nav.classList.remove('sidebar');
      return;
    }

    nav.classList.add('sidebar');

    nav.innerHTML = `
      <div class="sidebar-header">
        <div class="sidebar-brand">Prode</div>
        <button class="sidebar-close" id="sidebar-close">&times;</button>
      </div>
      <nav class="sidebar-nav">
        <a href="#/dashboard" class="sidebar-link" data-route>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Inicio
        </a>
        <a href="#/partidos" class="sidebar-link" data-route>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          Partidos
        </a>
        <a href="#/mis-pronosticos" class="sidebar-link" data-route>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
          Mis Pronósticos
        </a>
        <a href="#/ranking" class="sidebar-link" data-route>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6-7 6 7"/><path d="M6 19h12"/><path d="M6 15h12"/></svg>
          Ranking
        </a>
        <a href="#/grupos" class="sidebar-link" data-route>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Grupos
        </a>
        ${isAdmin ? `
        <a href="#/admin" class="sidebar-link" data-route>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Admin
        </a>` : ''}
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="avatar avatar-sm">${Helpers.getInitials(user?.username)}</div>
          <span class="sidebar-username">${Helpers.escapeHtml(user?.username || '')}</span>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="Auth.logout()">Salir</button>
      </div>
    `;

    this._setActiveLink();
    this._bindEvents();
  },

  _setActiveLink() {
    const currentPath = Router.getCurrentPath();
    document.querySelectorAll('.sidebar-link').forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${currentPath}`);
    });
  },

  _hideMobileHeader() {
    const header = document.getElementById('mobile-header');
    if (header) header.style.display = 'none';
    const main = document.getElementById('main-content');
    if (main) main.classList.remove('mobile-header-visible');
  },

  _renderMobileHeader() {
    let header = document.getElementById('mobile-header');
    if (!header) {
      header = document.createElement('div');
      header.id = 'mobile-header';
      header.className = 'mobile-header';
      header.innerHTML = `
        <button class="menu-btn" id="menu-btn" aria-label="Abrir menú">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div class="sidebar-brand">Prode</div>
      `;
      document.body.prepend(header);
    }

    const main = document.getElementById('main-content');
    if (Auth.isAuthenticated()) {
      header.style.display = 'flex';
      if (main) main.classList.add('mobile-header-visible');
    } else {
      header.style.display = 'none';
      if (main) main.classList.remove('mobile-header-visible');
    }
  },

  _bindEvents() {
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('sidebar-close');
    const overlay = document.getElementById('sidebar-overlay');

    if (menuBtn) {
      menuBtn.addEventListener('click', () => this.open());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    if (overlay) {
      overlay.addEventListener('click', () => this.close());
    }
  },

  open() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('open');
  },

  close() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
  },
};

document.addEventListener('DOMContentLoaded', () => {
  const existingStyle = document.querySelector('style[data-navbar]');
  if (existingStyle) existingStyle.remove();

  const style = document.createElement('style');
  style.setAttribute('data-navbar', '');
  style.textContent = `
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 260px;
      background: var(--color-bg-card);
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      padding: var(--space-lg);
      z-index: 100;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-xl);
    }

    .sidebar-brand {
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      background: var(--color-primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .sidebar-close {
      display: none;
      font-size: 1.5rem;
      color: var(--color-text-muted);
      padding: 0;
      line-height: 1;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      flex: 1;
    }

    .sidebar-link {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: 12px var(--space-md);
      border-radius: var(--radius-md);
      color: var(--color-text-secondary);
      font-weight: 500;
      font-size: 0.9rem;
      transition: background var(--transition), color var(--transition);
    }

    .sidebar-link:hover {
      background: var(--color-bg-hover);
      color: var(--color-text);
      text-decoration: none;
    }

    .sidebar-link.active {
      background: rgba(37, 99, 235, 0.15);
      color: var(--color-primary-light);
    }

    .sidebar-footer {
      border-top: 1px solid var(--color-border);
      padding-top: var(--space-md);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .sidebar-user {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }

    .sidebar-username {
      font-size: 0.85rem;
      font-weight: 500;
    }

    .mobile-header {
      display: none;
      align-items: center;
      gap: var(--space-md);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 56px;
      padding: 0 var(--space-md);
      background: var(--color-bg-card);
      border-bottom: 1px solid var(--color-border);
      z-index: 99;
    }

    .mobile-header .sidebar-brand {
      font-size: 1.2rem;
    }

    .menu-btn {
      background: none;
      border: none;
      color: var(--color-text);
      padding: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
    }

    .menu-btn:hover {
      background: var(--color-bg-hover);
    }

    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        box-shadow: var(--shadow-xl);
      }

      .sidebar.open {
        transform: translateX(0);
      }

      .sidebar-close {
        display: block;
      }

      .layout-main.mobile-header-visible {
        padding-top: 72px;
      }

      .mobile-header {
        display: flex;
      }
    }

    @media (min-width: 769px) {
      .mobile-header {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);

  State.subscribe(() => Navbar.render());
});
