const Modal = {
  _id: 0,

  show({ title, body, onConfirm, confirmText = 'Confirmar', cancelText = 'Cancelar', showCancel = true }) {
    this._id++;
    const id = `modal-${this._id}`;

    const html = `
      <div id="${id}" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>${title}</h3>
            <button class="modal-close" onclick="Modal.close('${id}')">&times;</button>
          </div>
          <div class="modal-body">${body}</div>
          <div class="modal-footer">
            ${showCancel ? `<button class="btn btn-secondary" onclick="Modal.close('${id}')">${cancelText}</button>` : ''}
            <button class="btn btn-primary" id="${id}-confirm">${confirmText}</button>
          </div>
        </div>
      </div>
    `;

    const container = document.getElementById('modal-container');
    container.insertAdjacentHTML('beforeend', html);

    document.getElementById(`${id}-confirm`).addEventListener('click', () => {
      if (onConfirm) onConfirm();
      this.close(id);
    });

    document.getElementById(id).addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.close(id);
    });
  },

  close(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  },
};

const style = document.createElement('style');
style.textContent = `
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--space-md);
  }

  .modal-content {
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-lg);
    border-bottom: 1px solid var(--color-border);
  }

  .modal-header h3 {
    font-size: 1.1rem;
  }

  .modal-close {
    font-size: 1.5rem;
    color: var(--color-text-muted);
    padding: 0;
    line-height: 1;
  }

  .modal-body {
    padding: var(--space-lg);
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-sm);
    padding: var(--space-lg);
    border-top: 1px solid var(--color-border);
  }
`;
document.head.appendChild(style);
