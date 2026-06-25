const Card = {
  render({ title, body, footer, className = '' }) {
    return `
      <div class="card ${className}">
        ${title ? `<div class="card-header"><h3 class="card-title">${title}</h3></div>` : ''}
        ${body ? `<div class="card-body">${body}</div>` : ''}
        ${footer ? `<div class="card-footer">${footer}</div>` : ''}
      </div>
    `;
  },
};
