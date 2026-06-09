import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { login as loginApi, getMe, refreshToken as refreshTokenApi, logout as logoutApi } from '../services/auth';

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
    logoutApi(); // limpa o cookie httpOnly no servidor (fire-and-forget)
    safeStorage.removeItem('token');
    safeStorage.removeItem('refreshToken'); // limpa residuos de versoes antigas
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
      try {
        const data = await refreshTokenApi(); // refresh token vem do cookie httpOnly
        safeStorage.setItem('token', data.token);
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
          // Token expirado — tentar refresh via cookie httpOnly
          try {
            const data = await refreshTokenApi();
            safeStorage.setItem('token', data.token);
            const userData = await getMe();
            setUser(userData);
            scheduleRefresh(data.token);
            setLoading(false);
            return;
          } catch {
            // Refresh falhou
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
    // refresh token fica no cookie httpOnly (definido pelo servidor) — nao em localStorage
    setUser(data.user);
    scheduleRefresh(data.token);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
