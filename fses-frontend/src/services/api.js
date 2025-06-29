// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for session auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// CSRF token management
let csrfToken = null;

const getCSRFToken = async () => {
  if (!csrfToken) {
    try {
      const response = await api.get('/auth/csrf/');
      csrfToken = response.data.csrfToken;
      
      // Set CSRF token in cookies
      document.cookie = `csrftoken=${csrfToken}; path=/`;
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
    }
  }
  return csrfToken;
};

// Request interceptor to add CSRF token and Authorization header
api.interceptors.request.use(async (config) => {
  if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
    const token = await getCSRFToken();
    if (token) {
      config.headers['X-CSRFToken'] = token;
    }
  }
  
  // Add Authorization header if token exists in localStorage
  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    config.headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  getCSRFToken: () => api.get('/auth/csrf/'),
  login: (credentials) => api.post('/auth/login/', credentials),
  logout: () => api.post('/auth/logout/'),
  getCurrentUser: () => api.get('/auth/user/'),
};

// Student API
export const studentAPI = {
  getAll: () => api.get('/api/students/'),
  getById: (id) => api.get(`/api/students/${id}/`),
  create: (data) => api.post('/api/students/', data),
  update: (id, data) => api.put(`/api/students/${id}/`, data),
  delete: (id) => api.delete(`/api/students/${id}/`),
};

// Lecturer API
export const lecturerAPI = {
  getAll: () => api.get('/api/lecturers/'),
  getById: (id) => api.get(`/api/lecturers/${id}/`),
  create: (data) => api.post('/api/lecturers/', data),
  update: (id, data) => api.put(`/api/lecturers/${id}/`, data),
  delete: (id) => api.delete(`/api/lecturers/${id}/`),
};

// Department API
export const departmentAPI = {
  getAll: () => api.get('/api/departments/'),
  getById: (id) => api.get(`/api/departments/${id}/`),
  create: (data) => api.post('/api/departments/', data),
  update: (id, data) => api.put(`/api/departments/${id}/`, data),
  delete: (id) => api.delete(`/api/departments/${id}/`),
};

// Nomination API
export const nominationAPI = {
  getAll: () => api.get('/api/nominations/'),
  getById: (id) => api.get(`/api/nominations/${id}/`),
  create: (data) => api.post('/api/nominations/', data),
  update: (id, data) => api.put(`/api/nominations/${id}/`, data),
  delete: (id) => api.delete(`/api/nominations/${id}/`),
};

// Postponement API
export const postponementAPI = {
  getAll: () => api.get('/api/postponements/'),
  getById: (id) => api.get(`/api/postponements/${id}/`),
  create: (data) => api.post('/api/postponements/', data),
  update: (id, data) => api.put(`/api/postponements/${id}/`, data),
  delete: (id) => api.delete(`/api/postponements/${id}/`),
};

export default api;