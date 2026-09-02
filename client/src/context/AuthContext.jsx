import { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import profileService from '../services/profileService';

export const AuthContext = createContext();

// ── Storage helpers ────────────────────────────────────────────────────────
// Support Remember Me: localStorage for persistent sessions, sessionStorage for tab-only.
const storage = {
  get: (key) => localStorage.getItem(key) || sessionStorage.getItem(key),
  set: (key, value, remember = false) => {
    if (remember) {
      localStorage.setItem(key, value);
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, value);
      localStorage.removeItem(key);
    }
  },
  remove: (key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
  clear: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]                       = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading]             = useState(true);

  // ── Bootstrap: verify tokens from backend on first mount ─────────────────
  useEffect(() => {
    const initAuth = async () => {
      const token     = storage.get('accessToken');
      const savedUser = storage.get('user');

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (e) {
          console.error('Error parsing saved user', e);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false); // Immediately unblock rendering

      // Silently verify and update user in background if token exists
      if (token) {
        try {
          const response = await profileService.getProfile();
          if (response?.data) {
            setUser(response.data);
            const isRemembered = !!localStorage.getItem('accessToken');
            storage.set('user', JSON.stringify(response.data), isRemembered);
          }
        } catch (error) {
          console.error('[Auth] Background profile verification failed:', error);
          // If it fails (e.g., 401), api.js interceptor will handle clearing storage and redirecting.
        }
      }
    };

    initAuth();
  }, []);

  // ── Login — supports rememberMe boolean flag ─────────────────────────────
  const login = useCallback(async (email, password, rememberMe = false) => {
    const response = await authService.login(email, password);
    const { user: userData, accessToken, refreshToken } = response.data || response;

    storage.set('accessToken',  accessToken,  rememberMe);
    storage.set('refreshToken', refreshToken, rememberMe);
    storage.set('user',         JSON.stringify(userData), rememberMe);

    setUser(userData);
    setIsAuthenticated(true);

    return userData;
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    } finally {
      storage.clear();
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // ── Update cached user (profile edits, photo updates) ────────────────────
  const updateUser = useCallback((userData) => {
    setUser(userData);
    const isRemembered = !!localStorage.getItem('accessToken');
    storage.set('user', JSON.stringify(userData), isRemembered);
  }, []);

  // ── Role check helper ────────────────────────────────────────────────────
  const hasRole = useCallback((role) => {
    if (!user) return false;
    if (Array.isArray(role)) return role.includes(user.role);
    return user.role === role;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
