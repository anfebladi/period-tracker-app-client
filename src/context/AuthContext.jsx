import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const TOKEN_KEY = 'period_app_user_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const setToken = useCallback((value) => {
    try {
      if (value) {
        localStorage.setItem(TOKEN_KEY, value);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
      setTokenState(value);
    } catch (_) {
      setTokenState(null);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
  }, [setToken]);

  return (
    <AuthContext.Provider value={{ token, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function isNewUser() {
  return !getStoredToken();
}
