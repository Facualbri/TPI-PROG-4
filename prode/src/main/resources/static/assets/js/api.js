const API_BASE = '/api';

async function apiRequest(method, path, body = null) {
  const token = Auth.getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body !== null) opts.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, opts);
  } catch (netErr) {
    throw new Error('Error de conexión con el servidor');
  }

  if (res.status === 401 && token) {
    Auth.clearSession();
    window.location.hash = '/login';
    throw new Error('Sesión expirada. Iniciá sesión nuevamente.');
  }

  if (res.status === 204) return null;

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Error ${res.status} - Respuesta inválida del servidor`);
  }

  if (!res.ok) {
    const msg = data.message || data.error || `Error ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

const Api = {
  get: (path) => apiRequest('GET', path),
  post: (path, body) => apiRequest('POST', path, body),
  put: (path, body) => apiRequest('PUT', path, body),
  patch: (path, body) => apiRequest('PATCH', path, body),
  del: (path) => apiRequest('DELETE', path),
};
