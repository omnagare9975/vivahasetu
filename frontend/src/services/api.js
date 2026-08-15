import axios from 'axios';

// On mobile (Capacitor), window.location is file:// so we use the env var
// On web dev, we use the proxy '/api'
const isNative = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();
const baseURL = import.meta.env.VITE_API_URL || (isNative ? 'https://your-backend-domain.com/api' : '/api');

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vs_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth endpoints that can return 401 without meaning "session expired"
const AUTH_PUBLIC_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthPublic = AUTH_PUBLIC_PATHS.some((p) => url.includes(p));
    const onLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';

    // Only force-logout on expired session — never on wrong password / failed login
    if (error.response?.status === 401 && !isAuthPublic && !onLoginPage) {
      localStorage.removeItem('vs_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
