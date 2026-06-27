const Toast = {
  _id: 0,

  show(message, type = 'info', duration = 4000) {
    this._id++;
    const id = `toast-${this._id}`;
    const container = document.getElementById('toast-container');

    const icons = {
      success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      error: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    };

    const el = document.createElement('div');
    el.id = id;
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="Toast.close('${id}')">&times;</button>
    `;

    container.appendChild(el);
    requestAnimationFrame(() => el.classList.add('toast-visible'));

    if (duration > 0) {
      setTimeout(() => this.close(id), duration);
    }
  },

  close(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('toast-visible');
    el.classList.add('toast-hiding');
    setTimeout(() => el.remove(), 300);
  },

  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error', 5000); },
  info(msg) { this.show(msg, 'info'); },
  warning(msg) { this.show(msg, 'warning'); },
};

const toastStyle = document.createElement('style');
toastStyle.textContent = `
  #toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
    max-width: 400px;
    width: 100%;
  }

  .toast {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: 14px 18px;
    border-radius: var(--radius-md);
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-lg);
    font-size: 0.875rem;
    transform: translateX(120%);
    opacity: 0;
    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
    pointer-events: all;
  }

  .toast-visible {
    transform: translateX(0);
    opacity: 1;
  }

  .toast-hiding {
    transform: translateX(120%);
    opacity: 0;
  }

  .toast-success { border-left: 4px solid var(--color-success); }
  .toast-error { border-left: 4px solid var(--color-danger); }
  .toast-info { border-left: 4px solid var(--color-accent); }
  .toast-warning { border-left: 4px solid var(--color-warning); }

  .toast-icon { display: flex; align-items: center; flex-shrink: 0; }
  .toast-success .toast-icon { color: var(--color-success); }
  .toast-error .toast-icon { color: var(--color-danger); }
  .toast-info .toast-icon { color: var(--color-accent); }
  .toast-warning .toast-icon { color: var(--color-warning); }

  .toast-message { flex: 1; font-weight: 500; }
  .toast-close {
    color: var(--color-text-muted);
    font-size: 1.3rem;
    padding: 0;
    line-height: 1;
    flex-shrink: 0;
    margin-left: var(--space-sm);
  }
  .toast-close:hover { color: var(--color-text); }

  @media (max-width: 480px) {
    #toast-container {
      left: 10px;
      right: 10px;
      top: 10px;
      max-width: none;
    }
  }
`;
document.head.appendChild(toastStyle);
