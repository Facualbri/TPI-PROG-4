const Navbar = {
  render() {
    const user = Auth.getUser();
    const isAdmin = Auth.isAdmin();
    const nav = document.getElementById('navbar');
    if (!nav) return;

    if (!Auth.isAuthenticated()) {
      nav.innerHTML = '';
      return;
    }

    nav.innerHTML = `
      <aside class="sidebar">
        <div class="sidebar-brand">Prode</div>
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
      </aside>
    `;
  },
};

document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
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
    }

    .sidebar-brand {
      font-size: 1.5rem;
      font-weight: 800;
      margin-bottom: var(--space-xl);
      color: var(--color-primary-light);
      letter-spacing: -0.02em;
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

    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        transition: transform var(--transition);
      }
      .sidebar.open {
        transform: translateX(0);
      }
      .layout-main {
        margin-left: 0;
      }
    }
  `;
  document.head.appendChild(style);

  State.subscribe(() => Navbar.render());
});
