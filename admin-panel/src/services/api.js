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

// Add a response interceptor to handle auth errors with token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry refresh or login requests
      if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
        safeRemoveToken();
        try { localStorage.removeItem('refreshToken'); } catch {}
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(
          `${api.defaults.baseURL}/api/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } }
        );

        const result = data.data || data;
        localStorage.setItem('token', result.token);
        localStorage.setItem('refreshToken', result.refreshToken);

        processQueue(null, result.token);
        originalRequest.headers.Authorization = `Bearer ${result.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        safeRemoveToken();
        try { localStorage.removeItem('refreshToken'); } catch {}
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
