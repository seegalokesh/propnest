import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('propnest_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('propnest_token');
      localStorage.removeItem('propnest_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
};

// Properties
export const propertiesAPI = {
  getAll: (params) => api.get('/api/properties', { params }),
  getById: (id) => api.get(`/api/properties/${id}`),
  create: (data) => api.post('/api/properties', data),
  update: (id, data) => api.put(`/api/properties/${id}`, data),
  updateStatus: (id, status) => api.put(`/api/properties/${id}/status`, { status }),
  delete: (id) => api.delete(`/api/properties/${id}`),
};

// Site Visits
export const visitsAPI = {
  getAll: () => api.get('/api/site-visits'),
  create: (data) => api.post('/api/site-visits', data),
  updateStatus: (id, status) => api.put(`/api/site-visits/${id}/status`, { status }),
};

// Inquiries
export const inquiriesAPI = {
  getAll: (params) => api.get('/api/inquiries', { params }),
  create: (data) => api.post('/api/inquiries', data),
  updateStatus: (id, data) => api.put(`/api/inquiries/${id}/status`, data),
};

// Agents
export const agentsAPI = {
  getAll: () => api.get('/api/agents'),
  getLeads: (id) => api.get(`/api/agents/${id}/leads`),
};

// Sales
export const salesAPI = {
  getAll: () => api.get('/api/sales'),
  create: (data) => api.post('/api/sales', data),
};

// Dashboard
export const dashboardAPI = {
  admin: () => api.get('/api/dashboard/admin'),
  agent: () => api.get('/api/dashboard/agent'),
};

// Favorites
export const favoritesAPI = {
  getAll: () => api.get('/api/favorites'),
  toggle: (propertyId) => api.post(`/api/favorites/${propertyId}`),
};

export default api;
