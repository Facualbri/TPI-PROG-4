const Toast = {
  _id: 0,

  show(message, type = 'info', duration = 4000) {
    this._id++;
    const id = `toast-${this._id}`;
    const container = document.getElementById('toast-container');

    const el = document.createElement('div');
    el.id = id;
    el.className = `toast toast-${type}`;
    el.innerHTML = `
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
    setTimeout(() => el.remove(), 200);
  },

  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error'); },
  info(msg) { this.show(msg, 'info'); },
  warning(msg) { this.show(msg, 'warning'); },
};

const toastStyle = document.createElement('style');
toastStyle.textContent = `
  .toast {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: 12px 16px;
    border-radius: var(--radius-md);
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-lg);
    font-size: 0.9rem;
    max-width: 400px;
    transform: translateX(120%);
    transition: transform 200ms ease;
    pointer-events: all;
  }

  .toast-visible {
    transform: translateX(0);
  }

  .toast-success { border-left: 4px solid var(--color-success); }
  .toast-error { border-left: 4px solid var(--color-danger); }
  .toast-info { border-left: 4px solid var(--color-info); }
  .toast-warning { border-left: 4px solid var(--color-warning); }

  .toast-message { flex: 1; }
  .toast-close {
    color: var(--color-text-muted);
    font-size: 1.2rem;
    padding: 0;
    line-height: 1;
  }
`;
document.head.appendChild(toastStyle);
