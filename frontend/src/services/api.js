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

// Handle token expiry globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vs_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
