const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('medivault_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401 && !endpoint.includes('/auth/login')) {
        localStorage.removeItem('medivault_token');
        localStorage.removeItem('medivault_user');
        window.dispatchEvent(new Event('medivault_auth_change'));
      }
      const error = new Error(data.error || 'Error en la petición');
      error.status = res.status;
      error.details = data.details;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getProfile: (reveal = false, password = null) => {
    const query = reveal ? `?reveal=true&password=${encodeURIComponent(password)}` : '';
    return request(`/auth/profile${query}`);
  },
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (payload) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),

  getNotes: () => request('/notes'),
  getNote: (id) => request(`/notes/${id}`),
  createNote: (payload) => request('/notes', { method: 'POST', body: JSON.stringify(payload) }),
  updateNote: (id, payload) => request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteNote: (id) => request(`/notes/${id}`, { method: 'DELETE' }),

  getUsers: () => request('/admin/users'),
  updateUserRole: (payload) => request('/admin/users/role', { method: 'PUT', body: JSON.stringify(payload) }),
  getAuditLogs: (eventType = '', limit = 100) => {
    const query = eventType ? `?eventType=${eventType}&limit=${limit}` : `?limit=${limit}`;
    return request(`/admin/audit-logs${query}`);
  },
  getStats: () => request('/admin/stats'),
  getDeletionRequests: () => request('/admin/deletion-requests'),

  getLegalInfo: () => request('/governance/legal'),
  requestAccountDeletion: (payload) => request('/governance/deletion-request', { method: 'POST', body: JSON.stringify(payload) }),

  getAgents: () => request('/ai-agents'),
  runAgent: (agentId, payload) => request(`/ai-agents/${agentId}`, { method: 'POST', body: JSON.stringify(payload) }),
  getAiHistory: () => request('/ai-agents/history/all'),

  getExchangeRate: () => request('/external/exchange-rate'),
  queryTaxpayer: (id) => request(`/external/taxpayer?id=${encodeURIComponent(id)}`),
  getWeather: () => request('/external/weather'),

  getHealth: () => request('/health')
};
