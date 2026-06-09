import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Send cookies with requests (for refresh token)
});

// ─── Request interceptor: attach access token ─────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 / token refresh ─────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isLoginRoute = originalRequest.url?.includes('/auth/login') ||
                         originalRequest.url?.includes('/auth/register') ||
                         originalRequest.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isLoginRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        const newToken = data.token;
        localStorage.setItem('token', newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Only redirect if not already on login/register
        if (!window.location.pathname.startsWith('/login') &&
            !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getPublicProfile: (username) => api.get(`/auth/profile/${username}`),
  refresh: () => api.post('/auth/refresh'),
};

// ─── Snippets API ─────────────────────────────────────────────────────────────
export const snippetsAPI = {
  getAll: (params) => api.get('/snippets', { params }),
  getMy: (params) => api.get('/snippets/my', { params }),
  getTags: () => api.get('/snippets/tags'),
  getById: (id) => api.get(`/snippets/${id}`),
  create: (data) => api.post('/snippets', data),
  update: (id, data) => api.put(`/snippets/${id}`, data),
  delete: (id) => api.delete(`/snippets/${id}`),
  fork: (id) => api.post(`/snippets/${id}/fork`),
  getForks: (id) => api.get(`/snippets/${id}/forks`),
  like: (id) => api.post(`/snippets/${id}/like`),
  unlike: (id) => api.delete(`/snippets/${id}/like`),
};

// ─── Collections API ──────────────────────────────────────────────────────────
export const collectionsAPI = {
  getAll: () => api.get('/collections'),
  getById: (id) => api.get(`/collections/${id}`),
  create: (data) => api.post('/collections', data),
  update: (id, data) => api.put(`/collections/${id}`, data),
  delete: (id) => api.delete(`/collections/${id}`),
  addSnippet: (collectionId, snippetId) =>
    api.post(`/collections/${collectionId}/snippets/${snippetId}`),
  removeSnippet: (collectionId, snippetId) =>
    api.delete(`/collections/${collectionId}/snippets/${snippetId}`),
};

// ─── Search API ───────────────────────────────────────────────────────────────
export const searchAPI = {
  search: (params) => api.get('/search', { params }),
};

export default api;
