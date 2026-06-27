const LoginPage = {
  async render(app) {
    const params = Router.getQueryParams();
    const initialTab = params.tab === 'register' ? 'register' : 'login';

    app.innerHTML = `
      <div class="login-page">
        <div class="login-card">
          <div class="login-header">
            <h1>Prode</h1>
            <p class="text-muted">Pronosticá los partidos y competí</p>
          </div>
          <div class="login-tabs">
            <button class="login-tab ${initialTab === 'login' ? 'active' : ''}" data-tab="login">Iniciar sesión</button>
            <button class="login-tab ${initialTab === 'register' ? 'active' : ''}" data-tab="register">Registrarse</button>
          </div>
          <div id="login-form-container">
            ${initialTab === 'login' ? LoginPage._renderLoginForm() : LoginPage._renderRegisterForm()}
          </div>
          <div id="login-error" class="alert alert-error" style="display:none"></div>
          <div id="login-forgot" style="display:none"></div>
        </div>
      </div>
    `;

    app.querySelectorAll('.login-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        app.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const form = tab.dataset.tab === 'login'
          ? LoginPage._renderLoginForm()
          : LoginPage._renderRegisterForm();
        document.getElementById('login-form-container').innerHTML = form;
        document.getElementById('login-error').style.display = 'none';
        LoginPage._bindForms(app);
      });
    });

    LoginPage._bindForms(app);
  },

  _renderLoginForm() {
    const remembered = Auth.getRememberedUsername();
    return `
      <form id="auth-form" class="login-form">
        <div class="form-group">
          <label class="form-label" for="login-username">Usuario</label>
          <input class="input" id="login-username" type="text" placeholder="Tu usuario" required autocomplete="username" value="${Helpers.escapeHtml(remembered)}">
        </div>
        <div class="form-group">
          <label class="form-label" for="login-password">Contraseña</label>
          <div class="login-password-field">
            <input class="input" id="login-password" type="password" placeholder="••••••••" required autocomplete="current-password">
            <button type="button" class="login-password-toggle" id="login-password-toggle" onclick="LoginPage._togglePassword('login-password', this)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
        <label class="login-remember">
          <input type="checkbox" id="login-remember" ${remembered ? 'checked' : ''}>
          Recordarme
        </label>
        <button class="btn btn-primary btn-lg" type="submit">Ingresar</button>
        <div class="login-form-footer">
          <a onclick="LoginPage._showForgotPassword()">¿Olvidaste tu contraseña?</a>
        </div>
      </form>
    `;
  },

  _renderRegisterForm() {
    return `
      <form id="auth-form" class="login-form">
        <div class="form-group">
          <label class="form-label" for="reg-username">Usuario</label>
          <input class="input" id="reg-username" type="text" placeholder="Entre 3 y 50 caracteres" required autocomplete="username" minlength="3" maxlength="50">
        </div>
        <div class="form-group">
          <label class="form-label" for="reg-email">Email</label>
          <input class="input" id="reg-email" type="email" placeholder="tu@email.com" required autocomplete="email">
        </div>
        <div class="form-group">
          <label class="form-label" for="reg-password">Contraseña</label>
          <div class="login-password-field">
            <input class="input" id="reg-password" type="password" placeholder="Mínimo 6 caracteres" required autocomplete="new-password" minlength="6">
            <button type="button" class="login-password-toggle" id="reg-password-toggle" onclick="LoginPage._togglePassword('reg-password', this)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
        <button class="btn btn-primary btn-lg" type="submit">Crear cuenta</button>
        <div class="login-form-footer">
          <span class="text-muted">Al registrarte aceptás nuestros</span>
          <a>Términos y Condiciones</a>
        </div>
      </form>
    `;
  },

  _bindForms(app) {
    const form = document.getElementById('auth-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorEl = document.getElementById('login-error');
      errorEl.style.display = 'none';

      const isLogin = app.querySelector('.login-tab.active').dataset.tab === 'login';
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Cargando...';

      try {
        if (isLogin) {
          const username = document.getElementById('login-username').value.trim();
          const password = document.getElementById('login-password').value;
          const remember = document.getElementById('login-remember')?.checked;

          if (!username || !password) {
            throw new Error('Completá todos los campos');
          }

          await Auth.login(username, password);

          if (remember) {
            Auth.setRemembered(username);
          } else {
            Auth.clearRemembered();
          }
          Toast.success('Sesión iniciada correctamente');
        } else {
          const username = document.getElementById('reg-username').value.trim();
          const email = document.getElementById('reg-email').value.trim();
          const password = document.getElementById('reg-password').value;

          if (!username || !email || !password) {
            throw new Error('Completá todos los campos');
          }
          if (username.length < 3) {
            throw new Error('El usuario debe tener al menos 3 caracteres');
          }
          if (password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
          }
          if (!email.includes('@')) {
            throw new Error('Ingresá un email válido');
          }

          await Auth.register(username, email, password);
          Toast.success('Cuenta creada correctamente');
        }
        Router.navigate('/dashboard');
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.style.display = 'block';
        btn.disabled = false;
        btn.textContent = isLogin ? 'Ingresar' : 'Crear cuenta';
      }
    });
  },

  _togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.innerHTML = isPassword
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  },

  _showForgotPassword() {
    Swal.fire({
      title: 'Recuperar contraseña',
      text: 'Lo sentimos, la recuperación de contraseña aún no está disponible. Contactate con el administrador.',
      icon: 'info',
      confirmButtonText: 'Entendido',
      background: '#1e293b',
      color: '#f8fafc',
      confirmButtonColor: '#22c55e',
    });
  },
};
