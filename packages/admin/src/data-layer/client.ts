import axios from 'axios';

// Use relative /api path so requests go through Vercel proxy
const API_URL = import.meta.env.VITE_API_URL || '/api';

// In-memory token store (survives page navigation, cleared on tab close)
let adminToken: string | null = sessionStorage.getItem('_at') ?? null;

export function setAdminToken(token: string | null) {
  adminToken = token;
  if (token) {
    sessionStorage.setItem('_at', token);
  } else {
    sessionStorage.removeItem('_at');
  }
}

export function getAdminToken() {
  return adminToken;
}

export const adminClient = axios.create({
  baseURL: API_URL + '/admin',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Authorization header on every request
adminClient.interceptors.request.use((config) => {
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
});

// Redirect to admin login on 401
adminClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url?.includes('/auth/')) {
      setAdminToken(null);
      const adminBase = window.location.pathname.startsWith('/admin') ? '/admin' : '';
      window.location.href = adminBase + '/login';
    }
    return Promise.reject(error);
  },
);
