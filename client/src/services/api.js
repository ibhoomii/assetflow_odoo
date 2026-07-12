import axios from 'axios';

// ─── Axios Instance ─────────────────────────────────────────────────────────

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ─── Request Interceptor: Attach JWT ────────────────────────────────────────

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Handle 401 globally ──────────────────────────────

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Network error (server offline)
    if (!error.response) {
      error.message = 'Network error — server may be offline';
    }

    return Promise.reject(error);
  }
);

// ─── Auth API Functions ─────────────────────────────────────────────────────

export const loginUser = (email, password) => {
  return API.post('/auth/login', { email, password });
};

export const registerUser = (userData) => {
  return API.post('/auth/register', userData);
};

export const getProfile = () => {
  return API.get('/auth/profile');
};

export const logoutUser = () => {
  return API.post('/auth/logout');
};

export const forgotPasswordAPI = (email) => {
  return API.post('/auth/forgot-password', { email });
};

export const resetPasswordAPI = (token, password) => {
  return API.post('/auth/reset-password', { token, password });
};

export default API;
