const TOKEN_KEY = 'prode_token';
const USER_KEY = 'prode_user';

const Auth = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
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
    return !!this.getToken();
  },

  isAdmin() {
    const user = this.getUser();
    return user && user.rol === 'ADMIN';
  },

  async login(username, password) {
    const data = await Api.post('/auth/login', { username, password });
    this.setSession(data.token, { username: data.username, rol: data.rol });
    return data;
  },

  async register(username, email, password) {
    const data = await Api.post('/auth/register', { username, email, password });
    this.setSession(data.token, { username: data.username, rol: data.rol });
    return data;
  },

  logout() {
    this.clearSession();
    Router.navigate('/login');
  },
};
