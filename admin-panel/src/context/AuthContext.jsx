import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { login as loginApi, getMe, refreshToken as refreshTokenApi } from '../services/auth';

const AuthContext = createContext();

// Safe localStorage wrapper for mobile browsers (especially private/incognito mode)
const safeStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Private browsing
    }
  }
};

// Parse JWT to get expiry time
const getTokenExpiry = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // Convert to ms
  } catch {
    return 0;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const logout = useCallback(() => {
    clearRefreshTimer();
    safeStorage.removeItem('token');
    safeStorage.removeItem('refreshToken');
    setUser(null);
  }, [clearRefreshTimer]);

  // Schedule token refresh 5 minutes before expiry
  const scheduleRefresh = useCallback((token) => {
    clearRefreshTimer();
    const expiry = getTokenExpiry(token);
    const now = Date.now();
    const refreshIn = Math.max(0, expiry - now - 5 * 60 * 1000); // 5 min before expiry

    if (refreshIn <= 0) return; // Token already expired or about to

    refreshTimerRef.current = setTimeout(async () => {
      const storedRefreshToken = safeStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        logout();
        return;
      }
      try {
        const data = await refreshTokenApi(storedRefreshToken);
        safeStorage.setItem('token', data.token);
        safeStorage.setItem('refreshToken', data.refreshToken);
        scheduleRefresh(data.token);
      } catch {
        logout();
      }
    }, refreshIn);
  }, [clearRefreshTimer, logout]);

  useEffect(() => {
    const loadUser = async () => {
      const token = safeStorage.getItem('token');
      if (token) {
        // Check if token is expired
        const expiry = getTokenExpiry(token);
        if (expiry && expiry < Date.now()) {
          // Try refresh
          const storedRefreshToken = safeStorage.getItem('refreshToken');
          if (storedRefreshToken) {
            try {
              const data = await refreshTokenApi(storedRefreshToken);
              safeStorage.setItem('token', data.token);
              safeStorage.setItem('refreshToken', data.refreshToken);
              const userData = await getMe();
              setUser(userData);
              scheduleRefresh(data.token);
              setLoading(false);
              return;
            } catch {
              // Refresh failed
            }
          }
          safeStorage.removeItem('token');
          safeStorage.removeItem('refreshToken');
          setLoading(false);
          return;
        }

        try {
          const userData = await getMe();
          setUser(userData);
          scheduleRefresh(token);
        } catch {
          safeStorage.removeItem('token');
          safeStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };
    loadUser();

    return () => clearRefreshTimer();
  }, [scheduleRefresh, clearRefreshTimer]);

  const login = async (email, password) => {
    const data = await loginApi(email, password);
    safeStorage.setItem('token', data.token);
    if (data.refreshToken) {
      safeStorage.setItem('refreshToken', data.refreshToken);
    }
    setUser(data.user);
    scheduleRefresh(data.token);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
