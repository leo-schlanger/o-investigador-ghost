import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Safe localStorage wrapper for mobile browsers (especially private/incognito mode)
const safeGetToken = () => {
  try {
    return localStorage.getItem('token');
  } catch (e) {
    console.warn('localStorage not available:', e);
    return null;
  }
};

const safeRemoveToken = () => {
  try {
    localStorage.removeItem('token');
  } catch (e) {
    console.warn('localStorage not available:', e);
  }
};

// Add a request interceptor to inject the token
api.interceptors.request.use(
  (config) => {
    const token = safeGetToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      safeRemoveToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
