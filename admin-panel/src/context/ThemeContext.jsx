import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Detect system theme preference
const getSystemTheme = () => {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
};

const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    // No stored preference - use system theme
    return getSystemTheme();
  } catch {
    return false;
  }
};

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(getInitialTheme);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    } catch {
      // Private browsing
    }
  }, [darkMode]);

  // Listen for system theme changes (only when no stored preference)
  useEffect(() => {
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        const hasStoredPref = localStorage.getItem('theme');
        if (!hasStoredPref) {
          setDarkMode(e.matches);
        }
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch {
      // matchMedia not supported
    }
  }, []);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
