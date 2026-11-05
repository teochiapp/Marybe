import React, { createContext, useState, useEffect } from 'react';
import {
  SESSION_EXPIRED_EVENT,
  clearCredentials,
  getTokenExpiration,
  installAxiosSessionInterceptor,
  isTokenExpired,
  notifySessionExpired
} from '../utils/sessionManager';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRedirect, setAuthRedirect] = useState(null);
  const [expiredSessionScope, setExpiredSessionScope] = useState(null);
  const [isReauthenticating, setIsReauthenticating] = useState(false);

  useEffect(() => {
    // Verificar si hay un token en local storage al iniciar
    const storedToken = localStorage.getItem('jwt');
    const storedUser = localStorage.getItem('user');
    const storedAdminToken = localStorage.getItem('admin_jwt');

    if (storedToken && storedUser && !isTokenExpired(storedToken)) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        clearCredentials('customer');
      }
    } else if (storedToken || storedUser) {
      clearCredentials('customer');
      if (storedToken && isTokenExpired(storedToken)) setExpiredSessionScope('customer');
    }
    if (storedAdminToken && isTokenExpired(storedAdminToken)) {
      clearCredentials('admin');
      setExpiredSessionScope('admin');
    }
    setIsLoading(false);

    const handleExpired = ({ detail }) => {
      if (detail?.scope !== 'admin') {
        setToken(null);
        setUser(null);
      }
      setIsReauthenticating(false);
      setExpiredSessionScope(detail?.scope || 'customer');
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    const removeAxiosInterceptor = installAxiosSessionInterceptor();
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
      removeAxiosInterceptor();
    };
  }, []);

  useEffect(() => {
    if (!token) return undefined;
    const expiration = getTokenExpiration(token);
    if (!expiration) return undefined;
    const remaining = expiration - Date.now();
    if (remaining <= 0) {
      notifySessionExpired('customer');
      return undefined;
    }
    const timer = window.setTimeout(() => notifySessionExpired('customer'), remaining);
    return () => window.clearTimeout(timer);
  }, [token]);

  const login = (jwt, userData) => {
    setToken(jwt);
    setUser(userData);
    localStorage.setItem('jwt', jwt);
    localStorage.setItem('user', JSON.stringify(userData));
    setExpiredSessionScope(null);
    setIsReauthenticating(false);
  };

  const updateToken = (jwt) => {
    setToken(jwt);
    localStorage.setItem('jwt', jwt);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    clearCredentials('customer');
    setExpiredSessionScope(null);
    setIsReauthenticating(false);
  };

  const openAuthModal = (redirectTo = null) => {
    if (typeof redirectTo === 'string') {
      setAuthRedirect(redirectTo);
      sessionStorage.setItem('authRedirect', redirectTo);
    } else {
      setAuthRedirect(null);
      sessionStorage.removeItem('authRedirect');
    }
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    if (isReauthenticating && !localStorage.getItem('jwt')) {
      setIsReauthenticating(false);
      setExpiredSessionScope('customer');
    }
  };
  const beginReauthentication = () => {
    setExpiredSessionScope(null);
    setIsReauthenticating(true);
    setIsAuthModalOpen(true);
  };
  const dismissExpiredSession = () => {
    clearCredentials(expiredSessionScope || 'customer');
    setExpiredSessionScope(null);
    setIsReauthenticating(false);
    setIsAuthModalOpen(false);
  };
  const clearAuthRedirect = () => {
    setAuthRedirect(null);
    sessionStorage.removeItem('authRedirect');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        updateToken,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authRedirect,
        clearAuthRedirect,
        expiredSessionScope,
        isSessionBlocked: Boolean(expiredSessionScope || isReauthenticating),
        beginReauthentication,
        dismissExpiredSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
