const LoginPage = {
  async render(main) {
    main.innerHTML = `
      <div class="login-page">
        <div class="login-card card">
          <div class="login-header">
            <h1>Prode</h1>
            <p class="text-muted">Pronosticá los partidos y competí</p>
          </div>
          <div class="login-tabs">
            <button class="login-tab active" data-tab="login">Iniciar sesión</button>
            <button class="login-tab" data-tab="register">Registrarse</button>
          </div>
          <div id="login-form-container">
            ${LoginPage._renderLoginForm()}
          </div>
          <div id="login-error" class="alert alert-error" style="display:none"></div>
        </div>
      </div>
    `;

    main.querySelectorAll('.login-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        main.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const form = tab.dataset.tab === 'login'
          ? LoginPage._renderLoginForm()
          : LoginPage._renderRegisterForm();
        document.getElementById('login-form-container').innerHTML = form;
        document.getElementById('login-error').style.display = 'none';
        LoginPage._bindForms(main);
      });
    });

    LoginPage._bindForms(main);
  },

  _renderLoginForm() {
    return `
      <form id="auth-form" class="login-form">
        <div class="form-group">
          <label class="form-label" for="login-username">Usuario</label>
          <input class="input" id="login-username" type="text" placeholder="Tu usuario" required autocomplete="username">
        </div>
        <div class="form-group">
          <label class="form-label" for="login-password">Contraseña</label>
          <input class="input" id="login-password" type="password" placeholder="••••••••" required autocomplete="current-password">
        </div>
        <button class="btn btn-primary btn-lg" type="submit">Ingresar</button>
      </form>
    `;
  },

  _renderRegisterForm() {
    return `
      <form id="auth-form" class="login-form">
        <div class="form-group">
          <label class="form-label" for="reg-username">Usuario</label>
          <input class="input" id="reg-username" type="text" placeholder="Entre 3 y 50 caracteres" required autocomplete="username">
        </div>
        <div class="form-group">
          <label class="form-label" for="reg-email">Email</label>
          <input class="input" id="reg-email" type="email" placeholder="tu@email.com" required autocomplete="email">
        </div>
        <div class="form-group">
          <label class="form-label" for="reg-password">Contraseña</label>
          <input class="input" id="reg-password" type="password" placeholder="Mínimo 6 caracteres" required autocomplete="new-password">
        </div>
        <button class="btn btn-primary btn-lg" type="submit">Crear cuenta</button>
      </form>
    `;
  },

  _bindForms(main) {
    const form = document.getElementById('auth-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorEl = document.getElementById('login-error');
      errorEl.style.display = 'none';

      const isLogin = main.querySelector('.login-tab.active').dataset.tab === 'login';

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Cargando...';

      try {
        if (isLogin) {
          const username = document.getElementById('login-username').value;
          const password = document.getElementById('login-password').value;
          await Auth.login(username, password);
        } else {
          const username = document.getElementById('reg-username').value;
          const email = document.getElementById('reg-email').value;
          const password = document.getElementById('reg-password').value;
          await Auth.register(username, email, password);
        }
        Toast.success(isLogin ? 'Sesión iniciada' : 'Cuenta creada correctamente');
        Router.navigate('/dashboard');
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.style.display = 'block';
        btn.disabled = false;
        btn.textContent = isLogin ? 'Ingresar' : 'Crear cuenta';
      }
    });
  },
};
