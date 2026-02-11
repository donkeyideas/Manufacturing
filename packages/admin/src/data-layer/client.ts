import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const adminClient = axios.create({
  baseURL: API_URL + '/admin',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Redirect to admin login on 401
adminClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url?.includes('/auth/')) {
      window.location.href = (import.meta.env.VITE_ADMIN_BASE || '') + '/login';
    }
    return Promise.reject(error);
  },
);
