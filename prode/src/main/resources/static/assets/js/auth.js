const TOKEN_KEY = 'prode_token';
const USER_KEY = 'prode_user';
const REMEMBER_KEY = 'prode_remember';

const Auth = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    if (this._isTokenExpired(token)) {
      this.clearSession();
      return false;
    }
    return true;
  },

  _isTokenExpired(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp) {
        return Date.now() >= payload.exp * 1000;
      }
      return false;
    } catch {
      return true;
    }
  },

  isAdmin() {
    const user = this.getUser();
    return user && (user.rol === 'ADMIN' || user.rol === 'ROLE_ADMIN');
  },

  async login(username, password) {
    const data = await Api.post('/auth/login', { username, password });
    const user = { username: data.username, rol: data.rol };
    this.setSession(data.token, user);
    return data;
  },

  async register(username, email, password) {
    const data = await Api.post('/auth/register', { username, email, password });
    const user = { username: data.username, rol: data.rol };
    this.setSession(data.token, user);
    return data;
  },

  async logout() {
    this.clearSession();
    Router.navigate('/');
  },

  hasRemembered() {
    return localStorage.getItem(REMEMBER_KEY) !== null;
  },

  getRememberedUsername() {
    return localStorage.getItem(REMEMBER_KEY) || '';
  },

  setRemembered(username) {
    localStorage.setItem(REMEMBER_KEY, username);
  },

  clearRemembered() {
    localStorage.removeItem(REMEMBER_KEY);
  },
};
