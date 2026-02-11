import axios from 'axios';

// Use relative /api path so requests go through Vercel proxy (same-origin cookies)
const API_URL = import.meta.env.VITE_API_URL || '/api';

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
      // Detect admin base from current URL path (robust regardless of env config)
      const adminBase = window.location.pathname.startsWith('/admin') ? '/admin' : '';
      window.location.href = adminBase + '/login';
    }
    return Promise.reject(error);
  },
);
