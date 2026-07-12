import axios from 'axios';

// ─── Axios Instance ─────────────────────────────────────────────────────────

const API = axios.create({
  baseURL: "http://127.0.0.1:5000",
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

export const getUsersAPI = () => {
  return API.get('/auth/users');
};

export const getDepartmentsAPI = () => {
  return API.get('/auth/departments');
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

// ─── Asset API Functions ────────────────────────────────────────────────────

export const getCategoriesAPI = () => {
  return API.get('/assets/categories');
};

export const getAssetsAPI = (params) => {
  return API.get('/assets', { params });
};

export const searchAssetsAPI = (query) => {
  return API.get('/assets/search', { params: { query } });
};

export const getAssetAPI = (id) => {
  return API.get(`/assets/${id}`);
};

export const createAssetAPI = (assetData) => {
  return API.post('/assets', assetData);
};

export const updateAssetAPI = (id, assetData) => {
  return API.put(`/assets/${id}`, assetData);
};

export const deleteAssetAPI = (id) => {
  return API.delete(`/assets/${id}`);
};

export const uploadAssetImageAPI = (formData) => {
  return API.post('/assets/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// ─── Allocations API Functions ──────────────────────────────────────────────

export const allocateAssetAPI = (id, allocationData) => {
  return API.post(`/assets/${id}/allocate`, allocationData);
};

export const returnAssetAPI = (id) => {
  return API.post(`/assets/${id}/return`);
};

export const getAllAllocationsAPI = () => {
  return API.get('/assets/allocations/all');
};

export const getAllMaintenanceAPI = () => {
  return API.get('/assets/maintenance/all');
};

// ─── Transfer API Functions ─────────────────────────────────────────────────

export const requestTransferAPI = (id, transferData) => {
  return API.post(`/assets/${id}/transfer`, transferData);
};

export const getTransfersAPI = () => {
  return API.get('/assets/transfers/list');
};

export const actionTransferAPI = (id, actionData) => {
  return API.post(`/assets/transfers/${id}/action`, actionData);
};

// ─── Notifications API Functions ────────────────────────────────────────────

export const getNotificationsAPI = () => {
  return API.get('/assets/notifications/list');
};

export const readNotificationsAPI = () => {
  return API.put('/assets/notifications/read');
};

export const clearNotificationsAPI = () => {
  return API.delete('/assets/notifications/clear');
};

export const raiseMaintenanceAPI = (maintenanceData) => {
  return API.post('/assets/maintenance/raise', maintenanceData);
};

export const resolveMaintenanceAPI = (id, resolveData) => {
  return API.post(`/assets/maintenance/${id}/resolve`, resolveData);
};

export default API;
