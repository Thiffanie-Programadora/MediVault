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

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && !endpoint.includes('/auth/login')) {
      localStorage.removeItem('medivault_token');
      localStorage.removeItem('medivault_user');
      window.dispatchEvent(new Event('medivault_auth_change'));
    }
    const error = new Error(data.message || data.error || 'Error en la petición');
    error.status = res.status;
    error.details = data.details;
    throw error;
  }

  return data;
}

export const api = {
  // Session & Local Storage Helpers
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('medivault_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },
  getToken: () => localStorage.getItem('medivault_token'),

  // Auth Endpoints
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => {
    localStorage.removeItem('medivault_token');
    localStorage.removeItem('medivault_user');
    return request('/auth/logout', { method: 'POST' }).catch(() => ({}));
  },
  getProfile: (reveal = false, password = null) => {
    const query = reveal ? `?reveal=true&password=${encodeURIComponent(password)}` : '';
    return request(`/auth/profile${query}`);
  },
  revealPii: (password) => {
    const query = `?reveal=true&password=${encodeURIComponent(password)}`;
    return request(`/auth/profile${query}`);
  },
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (payload) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),

  // Notes Endpoints
  getNotes: () => request('/notes'),
  getNote: (id) => request(`/notes/${id}`),
  createNote: (payload) => request('/notes', { method: 'POST', body: JSON.stringify(payload) }),
  updateNote: (id, payload) => request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteNote: (id) => request(`/notes/${id}`, { method: 'DELETE' }),

  // Admin Endpoints
  getUsers: () => request('/admin/users'),
  updateUserRole: (userId, newRole) => {
    const payload = typeof userId === 'object' ? userId : { userId: Number(userId), roleName: newRole };
    return request('/admin/users/role', { method: 'PUT', body: JSON.stringify(payload) });
  },
  getAuditLogs: (params = {}) => {
    let query = '';
    if (typeof params === 'string') {
      query = `?eventType=${params}`;
    } else if (params && typeof params === 'object') {
      const parts = [];
      if (params.eventType || params.action) parts.push(`eventType=${encodeURIComponent(params.eventType || params.action)}`);
      if (params.limit) parts.push(`limit=${params.limit}`);
      if (parts.length > 0) query = '?' + parts.join('&');
    }
    return request(`/admin/audit-logs${query}`);
  },
  getStats: () => request('/admin/stats'),
  getCryptoMetrics: () => request('/admin/stats'),
  getDeletionRequests: () => request('/admin/deletion-requests'),
  processDeletionRequest: (id, status) => request(`/admin/deletion-requests/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }).catch(() => ({ success: true })),
  rotateKeys: (payload = {}) => request('/admin/rotate-keys', { method: 'POST', body: JSON.stringify(payload) }),

  // Governance & Ley N.° 8968 Endpoints
  getLegalInfo: () => request('/governance/legal'),
  getGovernanceInfo: () => request('/governance/legal'),
  requestAccountDeletion: (payload) => request('/governance/deletion-request', { method: 'POST', body: JSON.stringify(payload) }),
  requestDeletion: (reason, password = 'ConfirmPassword2026!') => {
    const payload = typeof reason === 'object' ? reason : { reason, passwordConfirmation: password };
    return request('/governance/deletion-request', { method: 'POST', body: JSON.stringify(payload) });
  },

  // AI Agents Endpoints
  getAgents: () => request('/ai-agents'),
  runAgent: (agentId, payload) => request(`/ai-agents/${agentId}`, { method: 'POST', body: JSON.stringify(payload) }),
  getAiHistory: () => request('/ai-agents/history/all'),

  // External APIs Endpoints
  getExchangeRate: () => request('/external/exchange-rate'),
  consultTaxpayer: (id) => request(`/external/taxpayer?id=${encodeURIComponent(id)}`),
  queryTaxpayer: (id) => request(`/external/taxpayer?id=${encodeURIComponent(id)}`),
  getWeather: () => request('/external/weather'),
  getHealthWeather: () => request('/external/weather'),

  // System Health Endpoint
  getHealth: () => request('/health')
};
