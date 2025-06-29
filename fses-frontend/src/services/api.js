// src/services/api.js
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for session auth
  headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': Cookies.get('csrftoken') || '',
  },
});

// CSRF token management
let csrfToken = null;

const getCSRFToken = async () => {
  if (!csrfToken || csrfToken) {
    try {
      const response = await api.get('/auth/csrf/');
      // Get CSRF token from cookie or response header
      const cookies = document.cookie.split(';');
      const csrfCookie = Cookies.get('csrftoken') || '';
      if (csrfCookie) {
        csrfToken = csrfCookie;
      }
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
    }
  }
  console.log('CSRF Token:', csrfToken); // Debugging line to check CSRF token
  console.log('Cookies:', Cookies.get('csrftoken')); // Debugging line to check cookies
  return csrfToken;
};

// Request interceptor to add CSRF token
api.interceptors.request.use(async (config) => {
  if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
    const token = await getCSRFToken();
    if (token) {
      config.headers['X-CSRFToken'] = token;
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state and redirect to login
      window.location.href = '/';
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
  getAll: () => api.get('/fses/api/students/'),
  getById: (id) => api.get(`/fses/api/student/${id}/`),
  create: (data) => api.post('/fses/api/student/create', data),  // Note the trailing slash
  update: (id, data) => api.put(`/fses/api/student/update/${id}/`, data),
  delete: (id) => api.delete(`/fses/api/student/delete/${id}/`),
};

// Lecturer API
export const lecturerAPI = {
  getAll: () => api.get('/fses/api/lecturers/'),
  getById: (id) => api.get(`/fses/api/lecturer/${id}/`),
  create: (data) => api.post('/fses/api/lecturer/create', data),
  update: (id, data) => api.put(`/fses/api/lecturer/update/${id}/`, data),
  delete: (id) => api.delete(`/fses/api/lecturer/delete/${id}/`),
};

// Department API
export const departmentAPI = {
  getAll: () => api.get('/fses/api/departments/'),
  getById: (id) => api.get(`/fses/api/department/${id}/`),
  create: (data) => api.post('/fses/api/department/create', data),
  update: (id, data) => api.put(`/fses/api/department/update/${id}/`, data),
  delete: (id) => api.delete(`/fses/api/department/delete/${id}/`),
};

// Nomination API
export const nominationAPI = {
  getAll: () => api.get('/fses/api/nominations/'),
  getById: (id) => api.get(`/fses/api/nomination/${id}/`),
  create: (data) => api.post('/fses/api/nomination/create', data),
  update: (id, data) => api.put(`/fses/api/nomination/update/${id}/`, data),
  delete: (id) => api.delete(`/fses/api/nomination/delete/${id}/`),
};

export default api;